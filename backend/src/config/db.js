const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
  ],
});

prisma.$on('query', (e) => {
  // Uncomment to debug raw SQL queries
  // logger.debug(`Query: ${e.query} ${e.params}`);
});

/**
 * Validates the database connection on app startup.
 * Throws an error to instantly crash if dev.db is missing or corrupted.
 */
async function connectDB() {
  try {
    // A simple query to test if the DB exists and schema is valid
    await prisma.$queryRaw`SELECT 1`;
    logger.info("SQLite Database connected successfully via Prisma.");
  } catch (error) {
    logger.error("Failed to connect to SQLite Database. Have you run 'npx prisma db push'?", { error: error.message });
    process.exit(1);
  }
}

// Export a singleton instance of the client, plus the connect function
module.exports = { prisma, connectDB };
