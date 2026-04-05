const express = require("express");
const verificationController = require("../controllers/verification.controller");
const { authenticate, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

const router = express.Router();

// All verification routes require authentication and Teacher/Manager/Admin roles
router.use(authenticate);
router.use(authorize(ROLES.TEACHER, ROLES.MANAGER, ROLES.ADMIN));

router.get("/pending", verificationController.listPending);
router.post("/approve/:txId", verificationController.approveTransaction);
router.post("/reject/:txId", verificationController.rejectTransaction);

module.exports = router;
