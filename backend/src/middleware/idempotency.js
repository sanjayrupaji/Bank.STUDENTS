const { sendFail } = require("../utils/response");

function attachIdempotencyKey(req, res, next) {
  const raw = req.get("Idempotency-Key") || req.get("idempotency-key");
  if (raw != null && String(raw).trim() !== "") {
    const key = String(raw).trim();
    if (key.length > 128) {
      return sendFail(res, 400, "Idempotency-Key must be at most 128 characters", null);
    }
    req.idempotencyKey = key;
  }
  next();
}

module.exports = { attachIdempotencyKey };
