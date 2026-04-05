const authService = require("../services/auth.service");
const { ROLES } = require("../config/constants");
const { sendSuccess } = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const { email, password, fullName, role, mentorEmail } = req.body;
  let apiRole = ROLES.STUDENT;
  if (role === "teacher") apiRole = ROLES.TEACHER;
  else if (role === "student") apiRole = ROLES.STUDENT;
  const result = await authService.register({
    email,
    password,
    fullName,
    role: apiRole,
    mentorEmail,
  });
  return sendSuccess(res, result, "Registered successfully", 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return sendSuccess(res, result, "Logged in");
});

const me = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.id);
  return sendSuccess(res, { user: profile });
});

module.exports = { register, login, me };
