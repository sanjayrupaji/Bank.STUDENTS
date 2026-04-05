const { prisma } = require("../config/db");
const AppError = require("../utils/AppError");
const { centsToDisplay } = require("../utils/money");
const { ROLES } = require("../config/constants");

function formatAccount(row) {
  return {
    id: row.id,
    accountNumber: row.accountNumber,
    balanceCents: row.balanceCents,
    balance: centsToDisplay(row.balanceCents),
    createdAt: row.createdAt,
  };
}

async function getMyAccount(userId) {
  const account = await prisma.account.findUnique({ where: { userId } });
  if (!account) throw new AppError("Account not found", 404);
  return formatAccount(account);
}

async function getAccountById(accountId, requesterId, role) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { user: { select: { email: true, fullName: true, id: true } } },
  });
  if (!account) throw new AppError("Account not found", 404);
  if (role !== ROLES.ADMIN && account.userId !== requesterId) {
    throw new AppError("Forbidden", 403);
  }
  return {
    ...formatAccount(account),
    owner: {
      email: account.user.email,
      fullName: account.user.fullName,
    },
  };
}

module.exports = { getMyAccount, getAccountById, formatAccount };
