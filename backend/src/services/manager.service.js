const { prisma } = require("../config/db");
const { TX_STATUS, ROLES } = require("../config/constants");
const { centsToDisplay } = require("../utils/money");
const AppError = require("../utils/AppError");

// ─── School Overview KPIs ───────────────────────────────────────────

async function getSchoolStats(schoolId) {
  const [
    teacherCount,
    studentCount,
    totalAccounts,
    balanceAggregate,
    pendingCount,
    completedCount,
    volumeAggregate,
  ] = await Promise.all([
    prisma.user.count({ where: { schoolId, role: ROLES.TEACHER, isActive: true } }),
    prisma.user.count({ where: { schoolId, role: ROLES.STUDENT, isActive: true } }),
    prisma.account.count({ where: { schoolId } }),
    prisma.account.aggregate({ where: { schoolId }, _sum: { balanceCents: true } }),
    prisma.transaction.count({ where: { schoolId, status: TX_STATUS.PENDING } }),
    prisma.transaction.count({ where: { schoolId, status: TX_STATUS.COMPLETED } }),
    prisma.transaction.aggregate({
      where: { schoolId, status: TX_STATUS.COMPLETED },
      _sum: { amountCents: true },
    }),
  ]);

  const totalBalanceCents = balanceAggregate._sum.balanceCents || 0;
  const totalVolumeCents = volumeAggregate._sum.amountCents || 0;

  return {
    teacherCount,
    studentCount,
    totalAccounts,
    totalBalanceCents,
    totalBalance: centsToDisplay(totalBalanceCents),
    pendingVerifications: pendingCount,
    completedTransactions: completedCount,
    totalVolumeCents,
    totalVolume: centsToDisplay(totalVolumeCents),
  };
}

// ─── Teacher Management ─────────────────────────────────────────────

async function listTeachers(schoolId) {
  const teachers = await prisma.user.findMany({
    where: { schoolId, role: ROLES.TEACHER, isActive: true },
    select: {
      id: true,
      email: true,
      fullName: true,
      createdAt: true,
      transactionsVerified: {
        where: { status: TX_STATUS.COMPLETED },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return teachers.map((t) => ({
    id: t.id,
    email: t.email,
    fullName: t.fullName,
    joinedAt: t.createdAt,
    verificationsCount: t.transactionsVerified.length,
  }));
}

async function removeTeacher(teacherId, schoolId) {
  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
  if (!teacher) throw new AppError("Teacher not found", 404);
  if (teacher.schoolId !== schoolId) throw new AppError("Teacher does not belong to this school", 403);
  if (teacher.role !== ROLES.TEACHER) throw new AppError("User is not a teacher", 400);

  // Disconnect from school and deactivate
  await prisma.user.update({
    where: { id: teacherId },
    data: { schoolId: null, isActive: false },
  });

  return { removed: true, teacherId };
}

// ─── School Transaction Feed ────────────────────────────────────────

async function listSchoolTransactions(schoolId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const safeLimit = Math.min(Math.max(1, limit), 100);

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { schoolId },
      include: {
        initiatedBy: { select: { fullName: true, email: true, role: true } },
        verifiedBy: { select: { fullName: true } },
        primaryAccount: { include: { user: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
    }),
    prisma.transaction.count({ where: { schoolId } }),
  ]);

  return {
    items: items.map((t) => ({
      id: t.id,
      type: t.type,
      status: t.status,
      amount: centsToDisplay(t.amountCents),
      amountCents: t.amountCents,
      description: t.description || "",
      createdAt: t.createdAt,
      studentName: t.primaryAccount?.user?.fullName || "—",
      initiatedBy: t.initiatedBy?.fullName || "—",
      initiatedByRole: t.initiatedBy?.role || "—",
      verifiedBy: t.verifiedBy?.fullName || null,
    })),
    pagination: {
      page,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

// ─── Leaderboard ────────────────────────────────────────────────────

async function getLeaderboard(schoolId) {
  // Top 5 savers — students with highest balance
  const topSavers = await prisma.account.findMany({
    where: { schoolId },
    include: { user: { select: { fullName: true, role: true } } },
    orderBy: { balanceCents: "desc" },
    take: 5,
  });

  // Top teacher — most verified transactions
  const teachers = await prisma.user.findMany({
    where: { schoolId, role: ROLES.TEACHER, isActive: true },
    select: {
      id: true,
      fullName: true,
      transactionsVerified: {
        where: { status: TX_STATUS.COMPLETED },
        select: { id: true },
      },
    },
  });

  const topTeachers = teachers
    .map((t) => ({
      id: t.id,
      fullName: t.fullName,
      verificationsCount: t.transactionsVerified.length,
    }))
    .sort((a, b) => b.verificationsCount - a.verificationsCount)
    .slice(0, 3);

  return {
    topSavers: topSavers.map((a, i) => ({
      rank: i + 1,
      fullName: a.user?.fullName || "Unknown",
      role: a.user?.role || "student",
      balance: centsToDisplay(a.balanceCents),
      balanceCents: a.balanceCents,
    })),
    topTeachers,
  };
}

// ─── Delete School (Nuclear) ────────────────────────────────────────

async function deleteSchool(schoolId, managerId) {
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) throw new AppError("School not found", 404);
  if (school.managerId !== managerId) throw new AppError("Only the school creator can delete it", 403);

  // Cascade delete in correct order to avoid FK violations
  await prisma.$transaction(async (tx) => {
    // 1. Delete all transactions for this school
    await tx.transaction.deleteMany({ where: { schoolId } });

    // 2. Delete savings goals & milestones for school accounts
    const schoolAccounts = await tx.account.findMany({
      where: { schoolId },
      select: { id: true },
    });
    const accountIds = schoolAccounts.map((a) => a.id);

    if (accountIds.length > 0) {
      await tx.savingsGoal.deleteMany({ where: { accountId: { in: accountIds } } });
      await tx.milestone.deleteMany({ where: { accountId: { in: accountIds } } });
    }

    // 3. Delete accounts
    await tx.account.deleteMany({ where: { schoolId } });

    // 4. Delete fees, announcements
    await tx.fee.deleteMany({ where: { schoolId } });
    await tx.announcement.deleteMany({ where: { schoolId } });

    // 5. Disconnect all users from school (don't delete user records)
    await tx.user.updateMany({
      where: { schoolId },
      data: { schoolId: null, isActive: false },
    });

    // 6. Delete the school itself
    await tx.school.delete({ where: { id: schoolId } });
  });

  return { deleted: true, schoolName: school.name };
}

module.exports = {
  getSchoolStats,
  listTeachers,
  removeTeacher,
  listSchoolTransactions,
  getLeaderboard,
  deleteSchool,
};
