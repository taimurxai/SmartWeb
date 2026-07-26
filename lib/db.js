import { PrismaClient } from "./generated/prisma/client";

// A hot-reloaded dev server re-executes this module on every edit; caching
// the client on `globalThis` stops each reload from opening a new
// connection/adapter on top of the last one.
const globalForPrisma = globalThis;

function createClient() {
  return new PrismaClient();
}

export const prisma = globalForPrisma.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
