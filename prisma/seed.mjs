// Run directly by Node (via `prisma db seed`), not bundled by Next.js, so it
// needs the generated client's real filename + extension (Next's webpack
// resolves extensionless "./client" for us elsewhere; plain Node doesn't).
import { PrismaClient } from "../lib/generated/prisma/client.ts";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { adminAuth } from "../lib/firebase-admin.js";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Idempotent: re-running the seed shouldn't fail on "email already exists" —
// reuse the existing Firebase account (and re-sync its password to the demo
// value) instead of erroring out.
async function upsertFirebaseUser(email, password) {
  try {
    const record = await adminAuth.createUser({ email, password });
    return record.uid;
  } catch (err) {
    if (err.code !== "auth/email-already-exists") throw err;
    const existing = await adminAuth.getUserByEmail(email);
    await adminAuth.updateUser(existing.uid, { password });
    return existing.uid;
  }
}

async function main() {
  const users = [
    { name: "Admin", email: "admin@demo.com", password: "admin123", role: "ADMIN" },
    { name: "User 1", email: "user1@demo.com", password: "user123", role: "NORMAL" },
    { name: "User 2", email: "user2@demo.com", password: "user123", role: "NORMAL" },
    { name: "User 3", email: "user3@demo.com", password: "user123", role: "NORMAL" },
  ];

  for (const u of users) {
    const firebaseUid = await upsertFirebaseUser(u.email, u.password);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, firebaseUid, role: u.role },
    });
  }

  // Demo codes matching the codes documented in README. Only the two fixed
  // outcomes are pre-seeded; the "in review, progresses live" demo code
  // (1234567890123456) is intentionally NOT pre-created here — its live
  // progression is timed from first submission (see lib/tracking.js), so
  // pre-seeding it would make it look permanently resolved by the time
  // anyone actually tries the demo.
  await prisma.trackingCode.upsert({
    where: { code: "9876543210987654" },
    update: {},
    create: { code: "9876543210987654", overrideStatus: "SUCCESS" },
  });
  await prisma.trackingCode.upsert({
    where: { code: "1111222233334444" },
    update: {},
    create: { code: "1111222233334444", overrideStatus: "FAILED" },
  });

  console.log(`Seeded ${users.length} users and 2 demo tracking codes.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
