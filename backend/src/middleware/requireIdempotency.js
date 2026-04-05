const { sendFail } = require("../utils/response");

/**
 * When IDEMPOTENCY_REQUIRED=1, POST /transactions/* must send Idempotency-Key (Stripe-style).
 */
function requireIdempotencyForTransactions(req, res, next) {
  if (process.env.IDEMPOTENCY_REQUIRED !== "1") {
    return next();
  }
  const raw = req.get("Idempotency-Key") || req.get("idempotency-key");
  if (!raw || !String(raw).trim()) {
    return sendFail(
      res,
      400,
      "Idempotency-Key header is required for this environment",
      null
    );
  }
  next();
}

module.exports = { requireIdempotencyForTransactions };
