const express = require("express");
const authRoutes = require("./auth.routes");
const accountRoutes = require("./account.routes");
const transactionRoutes = require("./transaction.routes");
const adminRoutes = require("./admin.routes");
const portalRoutes = require("./portal.routes");
const verificationRoutes = require("./verification.routes");
const announcementRoutes = require("./announcement.routes");
const managerRoutes = require("./manager.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/accounts", accountRoutes);
router.use("/transactions", transactionRoutes);
router.use("/admin", adminRoutes);
router.use("/portal", portalRoutes);
router.use("/verification", verificationRoutes);
router.use("/announcements", announcementRoutes);
router.use("/manager", managerRoutes);

module.exports = router;
