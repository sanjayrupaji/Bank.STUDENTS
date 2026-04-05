const logger = require("../config/logger");

function requestLogger(req, res, next) {
  const start = Date.now();
  const path = req.originalUrl?.split("?")[0] || req.url;

  res.on("finish", () => {
    const ms = Date.now() - start;
    const meta = { method: req.method, path, status: res.statusCode, ms };
    if (res.statusCode >= 500) logger.error("HTTP", meta);
    else if (res.statusCode >= 400) logger.warn("HTTP", meta);
    else logger.info("HTTP", meta);
  });

  next();
}

module.exports = requestLogger;
