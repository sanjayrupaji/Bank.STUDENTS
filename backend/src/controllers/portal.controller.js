const portalService = require("../services/portal.service");
const { sendSuccess } = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");

const teacherOverview = asyncHandler(async (req, res) => {
  const data = await portalService.teacherOverview(req.user.id);
  return sendSuccess(res, data);
});

const listStudents = asyncHandler(async (req, res) => {
  const students = await portalService.listStudents(req.user.id);
  return sendSuccess(res, { students });
});

const listTeacherAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await portalService.listTeacherAnnouncements(req.user.id);
  return sendSuccess(res, { announcements });
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, body, isPinned } = req.body;
  const created = await portalService.createAnnouncement(req.user.id, {
    title,
    body,
    isPinned,
  });
  return sendSuccess(res, { announcement: created }, "Announcement published", 201);
});

const studentAnnouncements = asyncHandler(async (req, res) => {
  const data = await portalService.listStudentAnnouncements(req.user.id);
  return sendSuccess(res, data);
});

module.exports = {
  teacherOverview,
  listStudents,
  listTeacherAnnouncements,
  createAnnouncement,
  studentAnnouncements,
};
