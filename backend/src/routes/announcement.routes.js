const express = require("express");
const announcementController = require("../controllers/announcement.controller");
const { authenticate, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(authenticate);

// List is available to all authenticated users in the school
router.get("/", announcementController.list);

// Create and Delete are restricted to Staff
router.post("/", authorize(ROLES.TEACHER, ROLES.MANAGER, ROLES.ADMIN), announcementController.create);
router.delete("/:id", authorize(ROLES.TEACHER, ROLES.MANAGER, ROLES.ADMIN), announcementController.remove);

module.exports = router;
