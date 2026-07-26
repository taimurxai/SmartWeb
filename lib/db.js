import { PrismaClient } from "./generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// A hot-reloaded dev server re-executes this module on every edit; caching
// the client on `globalThis` stops each reload from opening a new SQLite
// connection/adapter on top of the last one.
const globalForPrisma = globalThis;

function createClient() {
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
