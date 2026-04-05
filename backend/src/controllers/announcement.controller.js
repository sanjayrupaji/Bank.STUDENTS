const announcementService = require("../services/announcement.service");
const { sendSuccess } = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");

const create = asyncHandler(async (req, res) => {
  const { title, body, isPinned } = req.body;
  const result = await announcementService.createAnnouncement({
    title,
    body,
    isPinned,
    teacherId: req.user.id,
    schoolId: req.user.schoolId,
  });
  return sendSuccess(res, result, "Announcement posted successfully", 201);
});

const list = asyncHandler(async (req, res) => {
  const items = await announcementService.listAnnouncements(req.user.schoolId);
  return sendSuccess(res, items, "Announcements fetched");
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await announcementService.deleteAnnouncement(id, req.user.schoolId);
  return sendSuccess(res, null, "Announcement deleted");
});

module.exports = {
  create,
  list,
  remove,
};
