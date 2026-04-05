require("dotenv").config();
const http = require("http");
const { connectDB } = require("./src/config/db");
const app = require("./src/app");
const logger = require("./src/config/logger");
const { initSocket } = require("./src/config/socket");

const PORT = process.env.PORT || 3000;

async function start() {
  const server = http.createServer(app);

  if (process.env.SKIP_DB_CONNECT === "1") {
    logger.warn("SKIP_DB_CONNECT=1 — starting without Database (health checks only)");
    server.listen(PORT, () => logger.info(`Banking API listening on port ${PORT}`));
    return;
  }

  await connectDB();
  initSocket(server);
  server.listen(PORT, () => logger.info(`Banking API listening on port ${PORT}`));
}

start().catch((err) => {
  logger.error("Failed to start", { err: err.message });
  process.exit(1);
});
