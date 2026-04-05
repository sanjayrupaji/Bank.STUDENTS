const AppError = require("./AppError");

/** Parse user amount string/number to positive integer cents. Max 1e12 cents guard. */
function toAmountCents(input) {
  const n = typeof input === "string" ? parseFloat(input.trim()) : Number(input);
  if (!Number.isFinite(n) || n <= 0) {
    throw new AppError("Amount must be a positive number", 400);
  }
  const cents = Math.round(n * 100);
  if (!Number.isInteger(cents) || cents < 1) {
    throw new AppError("Amount too small after conversion to minor units", 400);
  }
  if (cents > 1e12) {
    throw new AppError("Amount exceeds maximum allowed", 400);
  }
  return cents;
}

function centsToDisplay(cents) {
  return (cents / 100).toFixed(2);
}

module.exports = { toAmountCents, centsToDisplay };
