const { prisma } = require("../config/db");
const AppError = require("../utils/AppError");
const { ROLES } = require("../config/constants");
const { isStudentRole } = require("../utils/roles");

const STUDENT_ROLES = [ROLES.STUDENT, ROLES.USER];

async function teacherOverview(teacherId) {
  const studentCount = await prisma.user.count({
    where: {
      mentorId: teacherId,
      role: { in: STUDENT_ROLES },
    },
  });
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const announcementsLast7Days = await prisma.announcement.count({
    where: {
      teacherId,
      createdAt: { gte: weekAgo },
    },
  });
  const announcementsTotal = await prisma.announcement.count({
    where: { teacherId },
  });
  return {
    studentCount,
    announcementsLast7Days,
    announcementsTotal,
  };
}

async function listStudents(teacherId) {
  const students = await prisma.user.findMany({
    where: {
      mentorId: teacherId,
      role: { in: STUDENT_ROLES },
    },
    orderBy: { createdAt: "desc" },
    include: { account: true },
  });

  return students.map((s) => {
    const acc = s.account;
    return {
      id: s.id,
      fullName: s.fullName,
      email: s.email,
      linkedAt: s.createdAt,
      balanceCents: acc ? acc.balanceCents : null,
      accountNumber: acc ? acc.accountNumber : null,
    };
  });
}

async function createAnnouncement(teacherId, { title, body, isPinned }) {
  const ann = await prisma.announcement.create({
    data: {
      teacherId,
      title: title.trim(),
      body: body.trim(),
      isPinned: !!isPinned,
    },
  });
  return {
    id: ann.id,
    title: ann.title,
    body: ann.body,
    isPinned: ann.isPinned,
    createdAt: ann.createdAt,
  };
}

async function listTeacherAnnouncements(teacherId) {
  const rows = await prisma.announcement.findMany({
    where: { teacherId },
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" },
    ],
    take: 100,
  });
  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    isPinned: a.isPinned,
    createdAt: a.createdAt,
  }));
}

async function listStudentAnnouncements(studentId) {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { mentorId: true, role: true },
  });
  if (!student) throw new AppError("User not found", 404);
  if (!isStudentRole(student.role)) {
    throw new AppError("This resource is for student accounts", 403);
  }
  if (!student.mentorId) {
    return { announcements: [], mentor: null };
  }
  
  const mentor = await prisma.user.findUnique({
    where: { id: student.mentorId },
    select: { fullName: true, email: true },
  });

  const announcements = await prisma.announcement.findMany({
    where: { teacherId: student.mentorId },
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" },
    ],
    take: 50,
  });

  return {
    mentor: mentor ? { fullName: mentor.fullName, email: mentor.email } : null,
    announcements: announcements.map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      isPinned: a.isPinned,
      createdAt: a.createdAt,
    })),
  };
}

module.exports = {
  teacherOverview,
  listStudents,
  createAnnouncement,
  listTeacherAnnouncements,
  listStudentAnnouncements,
};
