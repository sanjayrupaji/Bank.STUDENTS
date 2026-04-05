const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const logger = require("./logger");
const realtimeService = require("../services/realtime.service");

let io;

function parseCorsOrigins() {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) return true;
  return raw.split(",").map((s) => s.trim());
}

function initSocket(httpServer) {
  if (io) return io;

  io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: parseCorsOrigins(),
      credentials: true,
    },
    pingTimeout: 25000,
    pingInterval: 20000,
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token || !process.env.JWT_SECRET) {
        return next(new Error("Unauthorized"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.sub;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    if (socket.userRole === "admin") {
      socket.join("admin");
    }
    logger.debug("Socket connected", { userId: socket.userId, role: socket.userRole });
    socket.on("disconnect", (reason) => {
      logger.debug("Socket disconnected", { userId: socket.userId, reason });
    });
  });

  realtimeService.registerSocketGetter(() => io);
  logger.info("Socket.io ready");
  return io;
}

function getIO() {
  return io;
}

module.exports = { initSocket, getIO };
