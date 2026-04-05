const express = require("express");
const { authenticate, requireBankingAccess } = require("../middleware/auth");
const { attachIdempotencyKey } = require("../middleware/idempotency");
const { requireIdempotencyForTransactions } = require("../middleware/requireIdempotency");
const { validate } = require("../middleware/validate");
const {
  depositRules,
  withdrawRules,
  transferRules,
  historyRules,
} = require("../validators/transaction.validators");
const transactionController = require("../controllers/transaction.controller");

const router = express.Router();

router.post(
  "/deposit",
  authenticate,
  requireBankingAccess,
  requireIdempotencyForTransactions,
  attachIdempotencyKey,
  depositRules,
  validate,
  transactionController.deposit
);
router.post(
  "/withdraw",
  authenticate,
  requireBankingAccess,
  requireIdempotencyForTransactions,
  attachIdempotencyKey,
  withdrawRules,
  validate,
  transactionController.withdraw
);
router.post(
  "/transfer",
  authenticate,
  requireBankingAccess,
  requireIdempotencyForTransactions,
  attachIdempotencyKey,
  transferRules,
  validate,
  transactionController.transfer
);
router.get(
  "/history/:accountId",
  authenticate,
  requireBankingAccess,
  historyRules,
  validate,
  transactionController.history
);

module.exports = router;
