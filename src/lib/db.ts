import { PrismaClient } from "@prisma/client";

/** DATABASE_URL が設定されているか（未設定なら DB オフ＝モック運用）。 */
export const DB_ENABLED = Boolean(process.env.DATABASE_URL);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Prisma シングルトン（DB 無効時は null）。 */
export const prisma: PrismaClient | null = DB_ENABLED
  ? (globalForPrisma.prisma ?? new PrismaClient())
  : null;

if (process.env.NODE_ENV !== "production" && prisma) globalForPrisma.prisma = prisma;
