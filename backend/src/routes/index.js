const express = require("express");
const authRoutes = require("./auth.routes");
const accountRoutes = require("./account.routes");
const transactionRoutes = require("./transaction.routes");
const adminRoutes = require("./admin.routes");
const portalRoutes = require("./portal.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/accounts", accountRoutes);
router.use("/transactions", transactionRoutes);
router.use("/admin", adminRoutes);
router.use("/portal", portalRoutes);

module.exports = router;
