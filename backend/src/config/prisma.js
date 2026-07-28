import { PrismaClient } from '@prisma/client';

let prismaInstance = null;

try {
  prismaInstance = new PrismaClient({
    log: ['error', 'warn']
  });
} catch (err) {
  console.warn('[Prisma Warning] Could not instantiate PrismaClient:', err.message);
}

export const prisma = prismaInstance;

export const connectDB = async () => {
  if (prisma) {
    try {
      await prisma.$connect();
      console.log('[Database] MySQL Connected via Prisma ORM successfully');
      return prisma;
    } catch (error) {
      console.warn(`[Database Warning] Failed to connect to MySQL (${error.message}). Running in fallback mode.`);
    }
  }
};
