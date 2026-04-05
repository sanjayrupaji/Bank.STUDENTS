const { prisma } = require("../config/db");
const { TX_TYPES, TX_STATUS } = require("../config/constants");
const AppError = require("../utils/AppError");
const { centsToDisplay } = require("../utils/money");
const { ROLES } = require("../config/constants");

async function idempotentResult(idempotencyKey) {
  if (!idempotencyKey) return null;
  const existing = await prisma.transaction.findUnique({ where: { idempotencyKey } });
  if (!existing) return null;
  if (existing.resultPayload) {
    try {
      return JSON.parse(existing.resultPayload);
    } catch (e) {
      return null;
    }
  }
  throw new AppError("Request with this idempotency key is still being processed", 409);
}

function buildPayload(txRow, accountSnapshots) {
  return {
    transaction: {
      id: txRow.id,
      type: txRow.type,
      amount: centsToDisplay(txRow.amountCents),
      amountCents: txRow.amountCents,
      status: txRow.status,
      createdAt: txRow.createdAt,
      description: txRow.description || "",
      counterpartyAccountId: txRow.counterpartyAccountId,
    },
    accounts: accountSnapshots.map((a) => ({
      id: a.id,
      accountNumber: a.accountNumber,
      balanceCents: a.balanceCents,
      balance: centsToDisplay(a.balanceCents),
    })),
  };
}

async function assertAccountAccess(account, userId, role, schoolId) {
  if (!account) throw new AppError("Account not found", 404);
  if (account.schoolId !== schoolId) {
    throw new AppError("Forbidden: account belongs to another school", 403);
  }
  // Admins/Managers/Teachers from the same school can access (depending on role logic)
  if (role === ROLES.ADMIN || role === ROLES.MANAGER || role === ROLES.TEACHER) return;
  if (account.userId !== userId) {
    throw new AppError("Forbidden: not your account", 403);
  }
}

async function deposit({ accountId, amountCents, userId, role, schoolId, idempotencyKey, description }) {
  const cached = await idempotentResult(idempotencyKey);
  if (cached) return cached;

  let payload;
  try {
    await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({ where: { id: accountId } });
      await assertAccountAccess(account, userId, role, schoolId);

      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: { balanceCents: { increment: amountCents } },
      });

      const dbTx = await tx.transaction.create({
        data: {
          idempotencyKey: idempotencyKey || undefined,
          type: TX_TYPES.DEPOSIT,
          status: TX_STATUS.COMPLETED,
          amountCents,
          schoolId,
          primaryAccountId: updatedAccount.id,
          initiatedById: userId,
          description: description || "",
        },
      });

      payload = buildPayload(dbTx, [updatedAccount]);
      
      await tx.transaction.update({
        where: { id: dbTx.id },
        data: { resultPayload: JSON.stringify(payload) },
      });
    });

    require("./realtime.service").notifyTransactionCommitted(payload);
    return payload;
  } catch (err) {
    if (err.code === "P2002" && err.meta?.target?.includes("idempotencyKey")) {
      const cachedAgain = await idempotentResult(idempotencyKey);
      if (cachedAgain) return cachedAgain;
    }
    throw err;
  }
}

async function withdraw({ accountId, amountCents, userId, role, schoolId, idempotencyKey, description }) {
  const cached = await idempotentResult(idempotencyKey);
  if (cached) return cached;

  let payload;
  try {
    await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({ where: { id: accountId } });
      await assertAccountAccess(account, userId, role, schoolId);

      if (account.balanceCents < amountCents) {
        throw new AppError("Insufficient balance", 400);
      }

      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: { balanceCents: { decrement: amountCents } },
      });

      if (updatedAccount.balanceCents < 0) {
        throw new AppError("Insufficient balance", 400);
      }

      const dbTx = await tx.transaction.create({
        data: {
          idempotencyKey: idempotencyKey || undefined,
          type: TX_TYPES.WITHDRAW,
          status: TX_STATUS.COMPLETED,
          amountCents,
          schoolId,
          primaryAccountId: updatedAccount.id,
          initiatedById: userId,
          description: description || "",
        },
      });

      payload = buildPayload(dbTx, [updatedAccount]);

      await tx.transaction.update({
        where: { id: dbTx.id },
        data: { resultPayload: JSON.stringify(payload) },
      });
    });

    require("./realtime.service").notifyTransactionCommitted(payload);
    return payload;
  } catch (err) {
    if (err.code === "P2002" && idempotencyKey) {
      const cachedAgain = await idempotentResult(idempotencyKey);
      if (cachedAgain) return cachedAgain;
    }
    throw err;
  }
}

async function transfer({
  fromAccountId,
  toAccountNumber,
  amountCents,
  userId,
  role,
  schoolId,
  idempotencyKey,
  description,
}) {
  const cached = await idempotentResult(idempotencyKey);
  if (cached) return cached;

  const toNumber = String(toAccountNumber).trim();
  if (!/^\d{12}$/.test(toNumber)) {
    throw new AppError("Counterparty account number must be 12 digits", 400);
  }

  let payload;
  try {
    await prisma.$transaction(async (tx) => {
      const fromAcc = await tx.account.findUnique({ where: { id: fromAccountId } });
      await assertAccountAccess(fromAcc, userId, role, schoolId);

      const toAcc = await tx.account.findUnique({ 
        where: { accountNumber: toNumber } 
      });
      
      if (!toAcc) throw new AppError("Destination account not found", 404);
      if (toAcc.schoolId !== schoolId) {
        throw new AppError("Cannot transfer to an account outside your school", 403);
      }
      if (toAcc.id === fromAcc.id) {
        throw new AppError("Cannot transfer to the same account", 400);
      }

      if (fromAcc.balanceCents < amountCents) {
        throw new AppError("Insufficient balance", 400);
      }

      const fromUpdated = await tx.account.update({
        where: { id: fromAcc.id },
        data: { balanceCents: { decrement: amountCents } },
      });
      if (fromUpdated.balanceCents < 0) {
        throw new AppError("Insufficient balance", 400);
      }

      const toUpdated = await tx.account.update({
        where: { id: toAcc.id },
        data: { balanceCents: { increment: amountCents } },
      });

      const dbTx = await tx.transaction.create({
        data: {
          idempotencyKey: idempotencyKey || undefined,
          type: TX_TYPES.TRANSFER,
          status: TX_STATUS.COMPLETED,
          amountCents,
          schoolId,
          primaryAccountId: fromUpdated.id,
          counterpartyAccountId: toUpdated.id,
          initiatedById: userId,
          description: description || "",
        },
      });

      payload = buildPayload(dbTx, [fromUpdated, toUpdated]);

      await tx.transaction.update({
        where: { id: dbTx.id },
        data: { resultPayload: JSON.stringify(payload) },
      });
    });

    require("./realtime.service").notifyTransactionCommitted(payload);
    return payload;
  } catch (err) {
    if (err.code === "P2002" && idempotencyKey) {
      const cachedAgain = await idempotentResult(idempotencyKey);
      if (cachedAgain) return cachedAgain;
    }
    throw err;
  }
}

async function listTransactionsForUser({ userId, accountId, page, limit, role, schoolId }) {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) throw new AppError("Account not found", 404);
  
  // Multi-tenant check
  if (account.schoolId !== schoolId) {
    throw new AppError("Forbidden: account belongs to another school", 403);
  }

  if (role !== ROLES.ADMIN && role !== ROLES.MANAGER && role !== ROLES.TEACHER && account.userId !== userId) {
    throw new AppError("Forbidden", 403);
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        schoolId, // Strict isolation
        OR: [
          { primaryAccountId: account.id },
          { counterpartyAccountId: account.id },
        ],
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.transaction.count({
      where: {
        schoolId, // Strict isolation
        OR: [
          { primaryAccountId: account.id },
          { counterpartyAccountId: account.id },
        ],
      },
    }),
  ]);

  const aid = account.id;
  const rows = items.map((t) => {
    const pid = t.primaryAccountId;
    const cid = t.counterpartyAccountId;
    let direction = "—";
    if (t.type === TX_TYPES.DEPOSIT) direction = pid === aid ? "in" : "—";
    else if (t.type === TX_TYPES.WITHDRAW) direction = pid === aid ? "out" : "—";
    else if (t.type === TX_TYPES.TRANSFER) {
      if (pid === aid) direction = "out";
      else if (cid === aid) direction = "in";
    }
    return {
      id: t.id,
      type: t.type,
      amount: centsToDisplay(t.amountCents),
      amountCents: t.amountCents,
      direction,
      description: t.description || "",
      createdAt: t.createdAt,
      counterpartyAccountId: cid,
    };
  });

  return {
    items: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

module.exports = {
  deposit,
  withdraw,
  transfer,
  listTransactionsForUser,
};
