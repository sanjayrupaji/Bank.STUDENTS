const managerService = require("../services/manager.service");
const { sendSuccess } = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");

const stats = asyncHandler(async (req, res) => {
  const data = await managerService.getSchoolStats(req.user.schoolId);
  return sendSuccess(res, data, "School stats fetched");
});

const teachers = asyncHandler(async (req, res) => {
  const data = await managerService.listTeachers(req.user.schoolId);
  return sendSuccess(res, data, "Teachers fetched");
});

const removeTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const data = await managerService.removeTeacher(teacherId, req.user.schoolId);
  return sendSuccess(res, data, "Teacher removed from school");
});

const transactions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const data = await managerService.listSchoolTransactions(req.user.schoolId, page, limit);
  return sendSuccess(res, data, "Transactions fetched");
});

const leaderboard = asyncHandler(async (req, res) => {
  const data = await managerService.getLeaderboard(req.user.schoolId);
  return sendSuccess(res, data, "Leaderboard fetched");
});

const deleteSchool = asyncHandler(async (req, res) => {
  const data = await managerService.deleteSchool(req.user.schoolId, req.user.id);
  return sendSuccess(res, data, "School deleted permanently");
});

module.exports = {
  stats,
  teachers,
  removeTeacher,
  transactions,
  leaderboard,
  deleteSchool,
};
