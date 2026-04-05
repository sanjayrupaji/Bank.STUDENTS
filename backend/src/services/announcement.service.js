const { prisma } = require("../config/db");
const AppError = require("../utils/AppError");

async function createAnnouncement({ title, body, teacherId, schoolId, isPinned = false }) {
  return prisma.announcement.create({
    data: {
      title,
      body,
      isPinned,
      teacherId,
      schoolId,
    },
  });
}

async function listAnnouncements(schoolId, limit = 10) {
  return prisma.announcement.findMany({
    where: { schoolId },
    include: { teacher: { select: { fullName: true } } },
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
  });
}

async function deleteAnnouncement(id, schoolId) {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) throw new AppError("Announcement not found", 404);
  if (existing.schoolId !== schoolId) throw new AppError("Forbidden", 403);
  
  return prisma.announcement.delete({ where: { id } });
}

module.exports = {
  createAnnouncement,
  listAnnouncements,
  deleteAnnouncement,
};
