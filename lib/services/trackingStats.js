import { prisma } from "../db";
import { resolveTrackingStatus } from "../tracking";

// Buckets a set of tracking codes (each paired with however many submissions
// should count toward it) into attempts/success/failed/inReview. Shared by
// both the global admin totals and a single user's totals so the two can
// never define "success" differently — attempts is always exactly
// success+failed+inReview, never a separately incremented counter.
function bucketCodes(codesWithCounts, now = new Date()) {
  const totals = { attempts: 0, success: 0, failed: 0, inReview: 0, suspicious: 0, liveChat: 0 };
  for (const { code, count } of codesWithCounts) {
    if (!count) continue;
    const { status } = resolveTrackingStatus(code, now);
    totals.attempts += count;
    if (status === "SUCCESS") totals.success += count;
    else if (status === "FAILED") totals.failed += count;
    else if (status === "SUSPICIOUS") totals.suspicious += count;
    else if (status === "LIVE_CHAT") totals.liveChat += count;
    else totals.inReview += count;
  }
  return totals;
}

export async function getGlobalTrackingTotals() {
  const codes = await prisma.trackingCode.findMany({
    select: {
      code: true,
      createdAt: true,
      overrideStatus: true,
      _count: { select: { submissions: true } },
    },
  });
  return bucketCodes(codes.map((c) => ({ code: c, count: c._count.submissions })));
}

export async function getUserTrackingTotals(userId) {
  const codes = await prisma.trackingCode.findMany({
    where: { submissions: { some: { userId } } },
    select: {
      code: true,
      createdAt: true,
      overrideStatus: true,
      _count: { select: { submissions: { where: { userId } } } },
    },
  });
  return bucketCodes(codes.map((c) => ({ code: c, count: c._count.submissions })));
}
