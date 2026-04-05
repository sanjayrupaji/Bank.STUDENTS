const { prisma } = require("../config/db");
const { TX_STATUS, TX_TYPES } = require("../config/constants");
const AppError = require("../utils/AppError");

async function listPending(schoolId) {
  return prisma.transaction.findMany({
    where: { 
      schoolId,
      status: TX_STATUS.PENDING 
    },
    include: {
      initiatedBy: { select: { fullName: true, email: true } },
      primaryAccount: { include: { user: { select: { fullName: true } } } },
      counterpartyAccount: { include: { user: { select: { fullName: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function approve(txId, teacherId, schoolId) {
  return prisma.$transaction(async (tx) => {
    const dbTx = await tx.transaction.findUnique({
      where: { id: txId },
      include: { primaryAccount: true, counterpartyAccount: true }
    });

    if (!dbTx) throw new AppError("Transaction not found", 404);
    if (dbTx.schoolId !== schoolId) throw new AppError("Forbidden: different school", 403);
    if (dbTx.status !== TX_STATUS.PENDING) throw new AppError("Transaction is not pending", 400);

    // 1. Perform balance logic based on type
    if (dbTx.type === TX_TYPES.WITHDRAW) {
      if (dbTx.primaryAccount.balanceCents < dbTx.amountCents) {
        throw new AppError("Insufficient balance for approval", 400);
      }
      await tx.account.update({
        where: { id: dbTx.primaryAccountId },
        data: { balanceCents: { decrement: dbTx.amountCents } }
      });
    } 
    else if (dbTx.type === TX_TYPES.DEPOSIT) {
      await tx.account.update({
        where: { id: dbTx.primaryAccountId },
        data: { balanceCents: { increment: dbTx.amountCents } }
      });
    }
    else if (dbTx.type === TX_TYPES.TRANSFER) {
      if (dbTx.primaryAccount.balanceCents < dbTx.amountCents) {
        throw new AppError("Insufficient balance for approval", 400);
      }
      await tx.account.update({
        where: { id: dbTx.primaryAccountId },
        data: { balanceCents: { decrement: dbTx.amountCents } }
      });
      await tx.account.update({
        where: { id: dbTx.counterpartyAccountId },
        data: { balanceCents: { increment: dbTx.amountCents } }
      });
    }

    // 2. Finalize Transaction
    const updated = await tx.transaction.update({
      where: { id: txId },
      data: {
        status: TX_STATUS.COMPLETED,
        verifiedById: teacherId,
        verifiedAt: new Date(),
      }
    });

    return updated;
  });
}

async function reject(txId, teacherId, schoolId, reason = "Rejected by teacher") {
  const dbTx = await prisma.transaction.findUnique({ where: { id: txId } });
  if (!dbTx) throw new AppError("Transaction not found", 404);
  if (dbTx.schoolId !== schoolId) throw new AppError("Forbidden", 403);
  if (dbTx.status !== TX_STATUS.PENDING) throw new AppError("Not pending", 400);

  return prisma.transaction.update({
    where: { id: txId },
    data: {
      status: TX_STATUS.FAILED,
      failureReason: reason,
      verifiedById: teacherId,
      verifiedAt: new Date(),
    }
  });
}

module.exports = {
  listPending,
  approve,
  reject,
};
