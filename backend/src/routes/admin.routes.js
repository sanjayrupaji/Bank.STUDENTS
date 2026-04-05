const express = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { ROLES } = require("../config/constants");
const adminController = require("../controllers/admin.controller");
const {
  analyticsPresetRules,
  activityRules,
  listQueryRules,
  transactionListRules,
} = require("../validators/admin.validators");

const router = express.Router();
const adminOnly = [authenticate, requireRole(ROLES.ADMIN)];
const schoolStaff = [authenticate, requireRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.TEACHER)];

router.get("/users", ...schoolStaff, listQueryRules, validate, adminController.users);
router.get("/accounts", ...schoolStaff, listQueryRules, validate, adminController.accounts);
router.get(
  "/transactions",
  ...schoolStaff,
  transactionListRules,
  validate,
  adminController.transactions
);
router.get(
  "/export/transactions",
  ...adminOnly,
  transactionListRules,
  validate,
  adminController.exportTransactions
);

router.get("/analytics/kpis", ...adminOnly, adminController.analyticsKpis);
router.get(
  "/analytics/volume",
  ...adminOnly,
  analyticsPresetRules,
  validate,
  adminController.analyticsVolume
);
router.get(
  "/analytics/flows",
  ...adminOnly,
  analyticsPresetRules,
  validate,
  adminController.analyticsFlows
);
router.get(
  "/analytics/growth",
  ...adminOnly,
  analyticsPresetRules,
  validate,
  adminController.analyticsGrowth
);
router.get("/activity", ...adminOnly, activityRules, validate, adminController.activity);
router.get("/system", ...adminOnly, adminController.system);

module.exports = router;
