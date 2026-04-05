const crypto = require("crypto");

function generateAccountNumber() {
  const n = crypto.randomInt(0, 1e12);
  return String(n).padStart(12, "0");
}

module.exports = generateAccountNumber;
