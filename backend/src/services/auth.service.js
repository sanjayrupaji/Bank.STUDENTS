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

async function register({ email, password, fullName, role: requestedRole, mentorEmail }) {
  const emailNorm = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (existing) throw new AppError("Email already registered", 409);

  let role = ROLES.STUDENT;
  if (requestedRole === ROLES.TEACHER) {
    role = ROLES.TEACHER;
  } else if (
    requestedRole === ROLES.STUDENT ||
    requestedRole === ROLES.USER ||
    requestedRole == null
  ) {
    role = ROLES.STUDENT;
  } else if (requestedRole === ROLES.ADMIN) {
    throw new AppError("Invalid account type", 400);
  }

  let mentorId = null;
  if (role === ROLES.STUDENT && mentorEmail) {
    const mentor = await prisma.user.findFirst({
      where: {
        email: String(mentorEmail).toLowerCase(),
        role: ROLES.TEACHER,
      },
    });
    if (!mentor) {
      throw new AppError(
        "No educator account matches that email. Confirm the address or ask your instructor to sign up first.",
        404
      );
    }
    mentorId = mentor.id;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: emailNorm,
        passwordHash,
        fullName: fullName.trim(),
        role,
        mentorId,
      },
    });

    if (role === ROLES.TEACHER) {
      return; // Teachers don't get bank accounts in this app
    }

    let created = false;
    for (let i = 0; i < 12; i++) {
      const accNum = generateAccountNumber();
      try {
        await tx.account.create({
          data: {
            userId: user.id,
            accountNumber: accNum,
            balanceCents: 0,
          },
        });
        created = true;
        break;
      } catch (e) {
        // Prisma throws P2002 for unique constraint failures
        if (e.code !== 'P2002') throw e;
      }
    }
    if (!created) throw new AppError("Could not allocate unique account number", 500);
  });

  const finalUser = await loadUserForClient({ email: emailNorm });
  // wait, loadUserForClient takes an ID. Let's fix that.
  const finalUserById = await prisma.user.findUnique({
    where: { email: emailNorm },
    include: { mentor: { select: { fullName: true, email: true } } },
  });

  const token = signToken(finalUserById);
  return { token, user: publicUser(finalUserById) };
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
