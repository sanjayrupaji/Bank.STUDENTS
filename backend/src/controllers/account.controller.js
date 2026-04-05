const accountService = require("../services/account.service");
const { sendSuccess } = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");

const myAccount = asyncHandler(async (req, res) => {
  const account = await accountService.getMyAccount(req.user.id);
  return sendSuccess(res, { account });
});

const getOne = asyncHandler(async (req, res) => {
  const data = await accountService.getAccountById(req.params.accountId, req.user.id, req.user.role);
  return sendSuccess(res, { account: data });
});

module.exports = { myAccount, getOne };
