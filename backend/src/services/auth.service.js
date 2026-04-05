const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");
const generateAccountNumber = require("../utils/generateAccountNumber");
const AppError = require("../utils/AppError");
const { ROLES } = require("../config/constants");

const SALT_ROUNDS = 12;

function publicUser(userRow) {
  const o = {
    id: userRow.id,
    email: userRow.email,
    fullName: userRow.fullName,
    role: userRow.role,
  };
  if (userRow.mentor) {
    o.mentor = {
      fullName: userRow.mentor.fullName,
      email: userRow.mentor.email,
    };
  }
  return o;
}

function signToken(userRow) {
  if (!process.env.JWT_SECRET) {
    throw new AppError("Server misconfiguration: JWT_SECRET missing", 500);
  }
  return jwt.sign(
    { sub: userRow.id, role: userRow.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function loadUserForClient(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      mentor: {
        select: { fullName: true, email: true },
      },
    },
  });
}

async function register({ email, password, fullName, role: requestedRole, schoolName, schoolCode }) {
  const emailNorm = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (existing) throw new AppError("Email already registered", 409);

  let role = ROLES.STUDENT;
  if (requestedRole === ROLES.MANAGER) {
    role = ROLES.MANAGER;
  } else if (requestedRole === ROLES.TEACHER) {
    role = ROLES.TEACHER;
  } else {
    role = ROLES.STUDENT;
  }

  let schoolId = null;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await prisma.$transaction(async (tx) => {
    let user;

    if (role === ROLES.MANAGER) {
      if (!schoolName) throw new AppError("School name is required for managers", 400);
      
      // 1. Create the Manager User
      user = await tx.user.create({
        data: {
          email: emailNorm,
          passwordHash,
          fullName: fullName.trim(),
          role: ROLES.MANAGER,
        },
      });

      // 2. Create the School and associate with Manager
      const newSchoolCode = `${schoolName.toUpperCase().replace(/\s+/g, "_")}-${Math.floor(1000 + Math.random() * 9000)}`;
      const school = await tx.school.create({
        data: {
          name: schoolName.trim(),
          uniqueCode: newSchoolCode,
          managerId: user.id,
        },
      });

      // 3. Link Manager to School
      schoolId = school.id;
      await tx.user.update({
        where: { id: user.id },
        data: { schoolId: school.id },
      });

    } else if (role === ROLES.TEACHER) {
      if (!schoolCode) throw new AppError("School code is required to join as a teacher", 400);
      
      const school = await tx.school.findUnique({ where: { uniqueCode: schoolCode } });
      if (!school) throw new AppError("Invalid school code. Please contact your administrator.", 404);
      
      schoolId = school.id;
      user = await tx.user.create({
        data: {
          email: emailNorm,
          passwordHash,
          fullName: fullName.trim(),
          role: ROLES.TEACHER,
          schoolId: school.id,
        },
      });

    } else {
      // STUDENT Registration (joined via school code)
      if (!schoolCode) throw new AppError("School code is required for students", 400);
      
      const school = await tx.school.findUnique({ where: { uniqueCode: schoolCode } });
      if (!school) throw new AppError("Invalid school code", 404);
      
      schoolId = school.id;
      user = await tx.user.create({
        data: {
          email: emailNorm,
          passwordHash,
          fullName: fullName.trim(),
          role: ROLES.STUDENT,
          schoolId: school.id,
        },
      });

      // Create Bank Account for Student
      let accCreated = false;
      for (let i = 0; i < 10; i++) {
        const accNum = generateAccountNumber();
        try {
          await tx.account.create({
            data: {
              userId: user.id,
              accountNumber: accNum,
              balanceCents: 0,
              schoolId: school.id,
            },
          });
          accCreated = true;
          break;
        } catch (e) {
          if (e.code !== 'P2002') throw e;
        }
      }
      if (!accCreated) throw new AppError("Failed to allocate account number", 500);
    }

    return user;
  });

  const finalUser = await prisma.user.findUnique({
    where: { id: result.id },
    include: { school: { select: { name: true, uniqueCode: true } } },
  });

  const token = signToken(finalUser);
  return { token, user: publicUser(finalUser) };
}

async function login({ email, password }) {
  const found = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!found) throw new AppError("Invalid email or password", 401);
  if (!found.isActive) throw new AppError("Account disabled", 403);

  const ok = await bcrypt.compare(password, found.passwordHash);
  if (!ok) throw new AppError("Invalid email or password", 401);

  const user = await loadUserForClient(found.id);
  const token = signToken(user);
  return { token, user: publicUser(user) };
}

async function getProfile(userId) {
  const user = await loadUserForClient(userId);
  if (!user) throw new AppError("User not found", 404);
  return publicUser(user);
}

module.exports = { register, login, getProfile, signToken, publicUser };
