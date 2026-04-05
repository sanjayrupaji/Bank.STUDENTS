const verificationService = require("../services/verification.service");
const { sendSuccess } = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const listPending = asyncHandler(async (req, res) => {
  // schoolId is injected by auth middleware
  const items = await verificationService.listPending(req.user.schoolId);
  return sendSuccess(res, items, "Pending transactions fetched");
});

const approveTransaction = asyncHandler(async (req, res) => {
  const { txId } = req.params;
  const result = await verificationService.approve(txId, req.user.id, req.user.schoolId);
  return sendSuccess(res, result, "Transaction approved successfully");
});

const rejectTransaction = asyncHandler(async (req, res) => {
  const { txId } = req.params;
  const { reason } = req.body;
  const result = await verificationService.reject(txId, req.user.id, req.user.schoolId, reason);
  return sendSuccess(res, result, "Transaction rejected");
});

module.exports = {
  listPending,
  approveTransaction,
  rejectTransaction,
};
