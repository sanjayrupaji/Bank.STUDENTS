const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");
const { sendFail } = require("../utils/response");
const AppError = require("../utils/AppError");
const { isBankingRole } = require("../utils/roles");

async function authenticate(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const m = hdr.match(/^Bearer\s+(.+)$/i);
    if (!m) {
      return sendFail(res, 401, "Authentication required", null);
    }
    if (!process.env.JWT_SECRET) {
      throw new AppError("Server misconfiguration", 500);
    }
    const decoded = jwt.verify(m[1], process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user || !user.isActive) {
      return sendFail(res, 401, "Invalid or expired session", null);
    }
    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch (e) {
    if (e.name === "JsonWebTokenError" || e.name === "TokenExpiredError") {
      return sendFail(res, 401, "Invalid or expired token", null);
    }
    next(e);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendFail(res, 401, "Authentication required", null);
    }
    if (!roles.includes(req.user.role)) {
      return sendFail(res, 403, "Insufficient permissions", null);
    }
    next();
  };
}

function requireBankingAccess(req, res, next) {
  if (!req.user) {
    return sendFail(res, 401, "Authentication required", null);
  }
  if (!isBankingRole(req.user.role)) {
    return sendFail(
      res,
      403,
      "Banking is available for student and administrator accounts only",
      null
    );
  }
  next();
}

module.exports = { authenticate, requireRole, requireBankingAccess };
