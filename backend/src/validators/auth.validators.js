const { body } = require("express-validator");

const registerRules = [
  body("email").isEmail().normalizeEmail().isLength({ max: 254 }),
  body("password")
    .isString()
    .isLength({ min: 8, max: 128 })
    .custom((v) => typeof v === "string" && /[A-Za-z]/.test(v) && /\d/.test(v))
    .withMessage("Password must include at least one letter and one number"),
  body("fullName").trim().isLength({ min: 1, max: 120 }),
  body("role").optional().isIn(["student", "teacher"]),
  body("mentorEmail").optional().isEmail().normalizeEmail(),
];

const loginRules = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 1, max: 128 }),
];

module.exports = { registerRules, loginRules };
