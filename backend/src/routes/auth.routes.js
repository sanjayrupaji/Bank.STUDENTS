const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/auth.controller");
const { registerRules, loginRules } = require("../validators/auth.validators");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const authPostLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, try again later", data: null },
});

router.post("/register", authPostLimit, registerRules, validate, authController.register);
router.post("/login", authPostLimit, loginRules, validate, authController.login);
router.get("/me", authenticate, authController.me);

module.exports = router;
