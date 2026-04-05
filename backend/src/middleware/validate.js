const { validationResult } = require("express-validator");
const { sendFail } = require("../utils/response");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendFail(res, 422, "Validation failed", errors.array());
  }
  next();
}

module.exports = { validate };
