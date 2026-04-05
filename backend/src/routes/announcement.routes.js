const express = require("express");
const announcementController = require("../controllers/announcement.controller");
const { authenticate, requireRole } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(authenticate);

// List is available to all authenticated users in the school
router.get("/", announcementController.list);

// Create and Delete are restricted to Staff
router.post("/", requireRole(ROLES.TEACHER, ROLES.MANAGER, ROLES.ADMIN), announcementController.create);
router.delete("/:id", requireRole(ROLES.TEACHER, ROLES.MANAGER, ROLES.ADMIN), announcementController.remove);

module.exports = router;
