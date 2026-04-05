const { body } = require("express-validator");

const teacherAnnouncementRules = [
  body("title").trim().isLength({ min: 1, max: 200 }),
  body("body").trim().isLength({ min: 1, max: 8000 }),
  body("isPinned").optional().isBoolean(),
];

module.exports = { teacherAnnouncementRules };
