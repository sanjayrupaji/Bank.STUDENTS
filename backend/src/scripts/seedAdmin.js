/**
 * Creates an admin user + account if one does not exist for ADMIN_EMAIL.
 * Usage: format the ADMIN_EMAIL and ADMIN_PASSWORD in .env
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const bcrypt = require("bcryptjs");
const { prisma } = require("../config/db");
const generateAccountNumber = require("../utils/generateAccountNumber");
const { ROLES } = require("../config/constants");

async function run() {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD required in .env");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== ROLES.ADMIN) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: ROLES.ADMIN },
      });
      console.log("User promoted to admin:", email);
    } else {
      console.log("Admin already exists:", email);
    }
    
    // We must disconnect
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        fullName: "System Administrator",
        role: ROLES.ADMIN,
      },
    });

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
        if (e.code !== "P2002") throw e;
      }
    }
    if (!created) throw new Error("Could not allocate account number");
  });

  console.log("Admin created:", email);
  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
