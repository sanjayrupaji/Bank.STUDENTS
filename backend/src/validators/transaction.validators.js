const { body, param, query } = require("express-validator");

const depositRules = [
  body("accountId").isMongoId(),
  body("amount").isFloat({ gt: 0 }),
  body("description").optional().isString().isLength({ max: 500 }),
];

const withdrawRules = [
  body("accountId").isMongoId(),
  body("amount").isFloat({ gt: 0 }),
  body("description").optional().isString().isLength({ max: 500 }),
];

const transferRules = [
  body("fromAccountId").isMongoId(),
  body("toAccountNumber").isString().trim().isLength({ min: 12, max: 12 }).isNumeric(),
  body("amount").isFloat({ gt: 0 }),
  body("description").optional().isString().isLength({ max: 500 }),
];

const historyRules = [
  param("accountId").isMongoId(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

module.exports = { depositRules, withdrawRules, transferRules, historyRules };
