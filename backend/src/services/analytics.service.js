const { prisma } = require("../config/db");
const { TX_TYPES, TX_STATUS } = require("../config/constants");
const { centsToDisplay } = require("../utils/money");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PRESETS = {
  daily: () => {
    const to = new Date();
    const from = new Date(to);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  },
  weekly: () => {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 7);
    return { from, to };
  },
  monthly: () => {
    const to = new Date();
    const from = new Date(to);
    from.setMonth(from.getMonth() - 1);
    return { from, to };
  },
};

function resolveRange(preset, fromStr, toStr) {
  if (fromStr && toStr) {
    const from = new Date(fromStr);
    const to = new Date(toStr);
    if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
      return { from, to };
    }
  }
  const fn = PRESETS[preset] || PRESETS.monthly;
  return fn();
}

async function getKpis() {
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, totalAccounts, totalTransactions, volAggregate, activeUsers7d] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.account.count(),
    prisma.transaction.count({ where: { status: TX_STATUS.COMPLETED } }),
    prisma.transaction.aggregate({
      _sum: { amountCents: true },
      where: { status: TX_STATUS.COMPLETED },
    }),
    prisma.transaction.findMany({
      where: {
        status: TX_STATUS.COMPLETED,
        createdAt: { gte: since7d },
      },
      select: { initiatedById: true },
      distinct: ['initiatedById'],
    }),
  ]);

  const totalVolumeCents = volAggregate._sum.amountCents || 0;

  return {
    totalUsers,
    totalAccounts,
    totalTransactions,
    totalVolumeCents,
    totalVolume: centsToDisplay(totalVolumeCents),
    activeUsersLast7Days: activeUsers7d.length,
  };
}

/** Daily buckets of transaction volume (₹) for line chart */
async function getVolumeOverTime(preset, fromStr, toStr) {
  const { from, to } = resolveRange(preset, fromStr, toStr);
  const transactions = await prisma.transaction.findMany({
    where: {
      status: TX_STATUS.COMPLETED,
      createdAt: { gte: from, lte: to },
    },
    select: {
      createdAt: true,
      amountCents: true,
    },
  });

  const dailyVolume = {};
  for (const t of transactions) {
    const dateStr = t.createdAt.toISOString().split("T")[0];
    if (!dailyVolume[dateStr]) dailyVolume[dateStr] = { volumeCents: 0, count: 0 };
    dailyVolume[dateStr].volumeCents += t.amountCents;
    dailyVolume[dateStr].count += 1;
  }

  const series = Object.keys(dailyVolume).sort().map((date) => ({
    date,
    volume: centsToDisplay(dailyVolume[date].volumeCents),
    volumeCents: dailyVolume[date].volumeCents,
    count: dailyVolume[date].count,
  }));

  return {
    range: { from, to },
    series,
  };
}

/** Inflow (deposits) vs outflow (withdrawals); transfers shown separately */
async function getFlows(preset, fromStr, toStr) {
  const { from, to } = resolveRange(preset, fromStr, toStr);
  const groups = await prisma.transaction.groupBy({
    by: ['type'],
    where: {
      status: TX_STATUS.COMPLETED,
      createdAt: { gte: from, lte: to },
    },
    _sum: { amountCents: true },
    _count: true,
  });

  const map = Object.fromEntries(groups.map((r) => [r.type, r]));
  const depositCents = map[TX_TYPES.DEPOSIT]?._sum?.amountCents || 0;
  const withdrawCents = map[TX_TYPES.WITHDRAW]?._sum?.amountCents || 0;
  const transferCents = map[TX_TYPES.TRANSFER]?._sum?.amountCents || 0;

  return {
    range: { from, to },
    inflowCents: depositCents,
    outflowCents: withdrawCents,
    transferVolumeCents: transferCents,
    inflow: centsToDisplay(depositCents),
    outflow: centsToDisplay(withdrawCents),
    transferVolume: centsToDisplay(transferCents),
    byType: groups.map((r) => ({
      type: r.type,
      amount: centsToDisplay(r._sum.amountCents || 0),
      cents: r._sum.amountCents || 0,
      count: r._count,
    })),
  };
}

/** New users & accounts per day */
async function getGrowth(preset, fromStr, toStr) {
  const { from, to } = resolveRange(preset, fromStr, toStr);
  const [users, accounts] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true },
    }),
    prisma.account.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true },
    }),
  ]);

  const usersPerDay = {};
  for (const u of users) {
    const d = u.createdAt.toISOString().split("T")[0];
    usersPerDay[d] = (usersPerDay[d] || 0) + 1;
  }

  const accountsPerDay = {};
  for (const a of accounts) {
    const d = a.createdAt.toISOString().split("T")[0];
    accountsPerDay[d] = (accountsPerDay[d] || 0) + 1;
  }

  return {
    range: { from, to },
    usersPerDay: Object.keys(usersPerDay).sort().map((date) => ({ date, count: usersPerDay[date] })),
    accountsPerDay: Object.keys(accountsPerDay).sort().map((date) => ({ date, count: accountsPerDay[date] })),
  };
}

async function getRecentActivity(limit = 40) {
  const n = Math.min(Math.max(1, limit), 100);
  const items = await prisma.transaction.findMany({
    where: { status: TX_STATUS.COMPLETED },
    orderBy: { createdAt: 'desc' },
    take: n,
    include: { initiatedBy: { select: { email: true, fullName: true } } },
  });

  return items.map((t) => ({
    id: t.id,
    type: t.type,
    amount: centsToDisplay(t.amountCents),
    amountCents: t.amountCents,
    description: t.description || "",
    createdAt: t.createdAt,
    initiatedBy: t.initiatedBy
      ? { email: t.initiatedBy.email, fullName: t.initiatedBy.fullName }
      : null,
  }));
}

function isValidObjectId(id) {
  return UUID_REGEX.test(id);
}

module.exports = {
  getKpis,
  getVolumeOverTime,
  getFlows,
  getGrowth,
  getRecentActivity,
  resolveRange,
  isValidObjectId,
};
