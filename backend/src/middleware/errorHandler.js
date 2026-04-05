const logger = require("../config/logger");
const AppError = require("../utils/AppError");
const errorRing = require("../utils/errorRing");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const statusCode = err.statusCode || 500;
  const isOp = err instanceof AppError || err.isOperational === true;
  if (!isOp) {
    logger.error(err.message, { stack: err.stack, path: req.path });
  }

  if (statusCode >= 500) {
    errorRing.push({
      message: err.message,
      path: req.originalUrl || req.path,
      statusCode,
    });
  }

  const message = isOp ? err.message : "Internal server error";
  const data = err.data !== undefined ? err.data : null;
  res.status(statusCode).json({ success: false, message, data });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null,
  });
}

module.exports = { errorHandler, notFoundHandler };
