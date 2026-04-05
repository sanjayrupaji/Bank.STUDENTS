const express = require("express");
const managerController = require("../controllers/manager.controller");
const { authenticate, requireRole } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

const router = express.Router();

// Every route here requires Manager role
router.use(authenticate);
router.use(requireRole(ROLES.MANAGER));

router.get("/stats", managerController.stats);
router.get("/teachers", managerController.teachers);
router.delete("/teachers/:teacherId", managerController.removeTeacher);
router.get("/transactions", managerController.transactions);
router.get("/leaderboard", managerController.leaderboard);
router.delete("/school", managerController.deleteSchool);

module.exports = router;
