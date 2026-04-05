const bankingService = require("../services/banking.service");
const { toAmountCents } = require("../utils/money");
const { sendSuccess } = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");
const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require("../config/constants");

const deposit = asyncHandler(async (req, res) => {
  const amountCents = toAmountCents(req.body.amount);
  const data = await bankingService.deposit({
    accountId: req.body.accountId,
    amountCents,
    userId: req.user.id,
    role: req.user.role,
    schoolId: req.user.schoolId,
    idempotencyKey: req.idempotencyKey,
    description: req.body.description,
  });
  return sendSuccess(res, data, "Deposit completed");
});

const withdraw = asyncHandler(async (req, res) => {
  const amountCents = toAmountCents(req.body.amount);
  const data = await bankingService.withdraw({
    accountId: req.body.accountId,
    amountCents,
    userId: req.user.id,
    role: req.user.role,
    schoolId: req.user.schoolId,
    idempotencyKey: req.idempotencyKey,
    description: req.body.description,
  });
  return sendSuccess(res, data, "Withdrawal completed");
});

const transfer = asyncHandler(async (req, res) => {
  const amountCents = toAmountCents(req.body.amount);
  const data = await bankingService.transfer({
    fromAccountId: req.body.fromAccountId,
    toAccountNumber: req.body.toAccountNumber,
    amountCents,
    userId: req.user.id,
    role: req.user.role,
    schoolId: req.user.schoolId,
    idempotencyKey: req.idempotencyKey,
    description: req.body.description,
  });
  return sendSuccess(res, data, "Transfer completed");
});

const history = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  let limit = parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE;
  limit = Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
  const data = await bankingService.listTransactionsForUser({
    userId: req.user.id,
    accountId: req.params.accountId,
    page,
    limit,
    role: req.user.role,
    schoolId: req.user.schoolId,
  });
  return sendSuccess(res, data);
});

module.exports = { deposit, withdraw, transfer, history };
