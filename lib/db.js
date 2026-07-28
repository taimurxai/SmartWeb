import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// A hot-reloaded dev server re-executes this module on every edit; caching
// the client on `globalThis` stops each reload from opening a new
// connection/adapter on top of the last one.
const globalForPrisma = globalThis;

function createClient() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const pool = new Pool({ 
    connectionString,
    max: process.env.NODE_ENV === "production" ? 20 : 5, // Enterprise production limits
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // 2s timeout
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
