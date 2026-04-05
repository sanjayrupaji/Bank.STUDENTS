const { prisma } = require("../config/db");
const adminService = require("../services/admin.service");
const analyticsService = require("../services/analytics.service");
const errorRing = require("../utils/errorRing");
const { sendSuccess } = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");

const users = asyncHandler(async (req, res) => {
  const { page, limit } = adminService.normalizePagination(req.query);
  const q = (req.query.q || "").trim();
  const sortField = req.query.sortField || "createdAt";
  const sortDir = req.query.sortDir === "asc" ? "asc" : "desc";
  const data = await adminService.listUsers(page, limit, q, sortField, sortDir);
  return sendSuccess(res, data);
});

const accounts = asyncHandler(async (req, res) => {
  const { page, limit } = adminService.normalizePagination(req.query);
  const q = (req.query.q || "").trim();
  const sortField = req.query.sortField || "createdAt";
  const sortDir = req.query.sortDir === "asc" ? "asc" : "desc";
  const data = await adminService.listAccounts(page, limit, q, sortField, sortDir);
  return sendSuccess(res, data);
});

const transactions = asyncHandler(async (req, res) => {
  const { page, limit } = adminService.normalizePagination(req.query);
  const q = (req.query.q || "").trim();
  const type = req.query.type || "";
  const sortField = req.query.sortField || "createdAt";
  const sortDir = req.query.sortDir === "asc" ? "asc" : "desc";
  const data = await adminService.listAllTransactions(page, limit, q, type, sortField, sortDir);
  return sendSuccess(res, data);
});

const exportTransactions = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  const type = req.query.type || "";
  const csv = await adminService.exportTransactionsCsv(q, type);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="transactions.csv"');
  res.send(csv);
});

const analyticsKpis = asyncHandler(async (req, res) => {
  const data = await analyticsService.getKpis();
  return sendSuccess(res, data);
});

const analyticsVolume = asyncHandler(async (req, res) => {
  const preset = req.query.preset || "monthly";
  const data = await analyticsService.getVolumeOverTime(
    preset,
    req.query.from,
    req.query.to
  );
  return sendSuccess(res, data);
});

const analyticsFlows = asyncHandler(async (req, res) => {
  const preset = req.query.preset || "monthly";
  const data = await analyticsService.getFlows(preset, req.query.from, req.query.to);
  return sendSuccess(res, data);
});

const analyticsGrowth = asyncHandler(async (req, res) => {
  const preset = req.query.preset || "monthly";
  const data = await analyticsService.getGrowth(preset, req.query.from, req.query.to);
  return sendSuccess(res, data);
});

const activity = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 40;
  const data = await analyticsService.getRecentActivity(limit);
  return sendSuccess(res, { items: data });
});

const system = asyncHandler(async (req, res) => {
  let dbStatus = "unknown";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (err) {
    dbStatus = "disconnected";
  }

  return sendSuccess(res, {
    uptime: Math.round(process.uptime()),
    uptimeHuman: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
    database: dbStatus,
    memory: {
      rss: process.memoryUsage().rss,
      heapUsed: process.memoryUsage().heapUsed,
      heapTotal: process.memoryUsage().heapTotal,
    },
    recentErrors: errorRing.snapshot(25),
    pid: process.pid,
    node: process.version,
  });
});

module.exports = {
  users,
  accounts,
  transactions,
  exportTransactions,
  analyticsKpis,
  analyticsVolume,
  analyticsFlows,
  analyticsGrowth,
  activity,
  system,
};
