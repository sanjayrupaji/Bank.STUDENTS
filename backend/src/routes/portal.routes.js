const express = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const { ROLES } = require("../config/constants");
const portalController = require("../controllers/portal.controller");
const { validate } = require("../middleware/validate");
const { teacherAnnouncementRules } = require("../validators/portal.validators");

const router = express.Router();

const teacherOnly = [authenticate, requireRole(ROLES.TEACHER)];

router.get("/teacher/overview", ...teacherOnly, portalController.teacherOverview);
router.get("/teacher/students", ...teacherOnly, portalController.listStudents);
router.get("/teacher/announcements", ...teacherOnly, portalController.listTeacherAnnouncements);
router.post(
  "/teacher/announcements",
  ...teacherOnly,
  teacherAnnouncementRules,
  validate,
  portalController.createAnnouncement
);

router.get(
  "/student/announcements",
  authenticate,
  requireRole(ROLES.STUDENT, ROLES.USER),
  portalController.studentAnnouncements
);

module.exports = router;
