const { query, param } = require("express-validator");

const analyticsPresetRules = [
  query("preset").optional().isIn(["daily", "weekly", "monthly"]),
  query("from").optional({ checkFalsy: true }).isISO8601().toDate(),
  query("to").optional({ checkFalsy: true }).isISO8601().toDate(),
];

const activityRules = [query("limit").optional().isInt({ min: 1, max: 100 })];

const listQueryRules = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("q").optional().isString().isLength({ max: 200 }),
  query("sortField").optional().isString(),
  query("sortDir").optional().isIn(["asc", "desc"]),
];

const transactionListRules = [
  ...listQueryRules,
  query("type").optional().isIn(["DEPOSIT", "WITHDRAW", "TRANSFER"]),
];

module.exports = {
  analyticsPresetRules,
  activityRules,
  listQueryRules,
  transactionListRules,
};
