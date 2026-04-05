const express = require("express");
const { param } = require("express-validator");
const { authenticate, requireBankingAccess } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const accountController = require("../controllers/account.controller");

const router = express.Router();

router.get("/me", authenticate, requireBankingAccess, accountController.myAccount);
router.get(
  "/:accountId",
  authenticate,
  requireBankingAccess,
  param("accountId").isMongoId(),
  validate,
  accountController.getOne
);

module.exports = router;
