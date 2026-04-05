const { prisma } = require("../config/db");
const { centsToDisplay } = require("../utils/money");
const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require("../config/constants");
const { TX_STATUS, TX_TYPES } = require("../config/constants");

const MAX_ADMIN_PAGE = Math.min(MAX_PAGE_SIZE, 100);

function normalizePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  let limit = parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE;
  limit = Math.min(Math.max(1, limit), MAX_ADMIN_PAGE);
  return { page, limit };
}

async function listUsers(page, limit, q, sortField, sortDir) {
  const skip = (page - 1) * limit;

  const where = {};
  if (q) {
    where.OR = [
      { email: { contains: q } },
      { fullName: { contains: q } },
    ];
  }

  const orderBy = {};
  if (sortField === "email") orderBy.email = sortDir;
  else if (sortField === "fullName") orderBy.fullName = sortDir;
  else orderBy.createdAt = sortDir || "desc";

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, email: true, fullName: true, role: true, isActive: true, createdAt: true },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

async function listAccounts(page, limit, q, sortField, sortDir) {
  const skip = (page - 1) * limit;

  const where = {};
  if (q) {
    where.accountNumber = { contains: q };
  }

  const orderBy = {};
  if (sortField === "accountNumber") orderBy.accountNumber = sortDir;
  else if (sortField === "balance") orderBy.balanceCents = sortDir;
  else orderBy.createdAt = sortDir || "desc";

  const [items, total] = await Promise.all([
    prisma.account.findMany({
      where,
      include: { user: { select: { id: true, email: true, fullName: true } } },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.account.count({ where }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      accountNumber: a.accountNumber,
      balance: centsToDisplay(a.balanceCents),
      balanceCents: a.balanceCents,
      owner: {
        id: a.user?.id,
        email: a.user?.email,
        fullName: a.user?.fullName,
      },
      createdAt: a.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function listAllTransactions(page, limit, q, type, sortField, sortDir) {
  const skip = (page - 1) * limit;
  const where = { status: TX_STATUS.COMPLETED };

  if (type && Object.values(TX_TYPES).includes(type)) {
    where.type = type;
  }

  if (q) {
    const OR = [{ description: { contains: q } }];
    if (UUID_REGEX.test(q)) {
      OR.push({ id: q });
    }
    where.OR = OR;
  }

  const orderBy = {};
  if (sortField === "amount") orderBy.amountCents = sortDir;
  else if (sortField === "type") orderBy.type = sortDir;
  else orderBy.createdAt = sortDir || "desc";

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { initiatedBy: { select: { email: true, fullName: true } } },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    items: items.map((t) => ({
      id: t.id,
      type: t.type,
      amount: centsToDisplay(t.amountCents),
      amountCents: t.amountCents,
      description: t.description || "",
      createdAt: t.createdAt,
      primaryAccount: t.primaryAccountId,
      counterpartyAccount: t.counterpartyAccountId,
      initiatedBy: t.initiatedBy
        ? { email: t.initiatedBy.email, fullName: t.initiatedBy.fullName }
        : null,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

async function exportTransactionsCsv(q, type) {
  const page = 1;
  const limit = 10000;
  const { items } = await listAllTransactions(page, limit, q, type, "createdAt", "desc");
  const headers = ["id", "type", "amount", "description", "createdAt", "initiatedByEmail"];
  const lines = [headers.join(",")];
  for (const t of items) {
    const row = [
      t.id,
      t.type,
      t.amount,
      `"${(t.description || "").replace(/"/g, '""')}"`,
      t.createdAt ? new Date(t.createdAt).toISOString() : "",
      `"${(t.initiatedBy?.email || "").replace(/"/g, '""')}"`,
    ];
    lines.push(row.join(","));
  }
  return "\uFEFF" + lines.join("\n");
}

module.exports = {
  listUsers,
  listAccounts,
  listAllTransactions,
  exportTransactionsCsv,
  normalizePagination,
};
