import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/rbac";
import { getGlobalTrackingTotals } from "@/lib/services/trackingStats";

// Global, platform-wide totals — always computed live from the raw tables,
// kept entirely separate from any single user's totals (lib/services/trackingStats
// exposes getUserTrackingTotals for that), so the two views can never
// contaminate each other's numbers.
export const GET = withAdmin(async () => {
  const [totalUsers, totalLogins, totals] = await Promise.all([
    prisma.user.count(),
    prisma.loginEvent.count({ where: { success: true } }),
    getGlobalTrackingTotals(),
  ]);

  return NextResponse.json({
    totalUsers,
    totalLogins,
    totalAttempts: totals.attempts,
    totalSuccess: totals.success,
    totalFailed: totals.failed,
    totalInReview: totals.inReview,
    totalSuspicious: totals.suspicious,
    totalLiveChat: totals.liveChat,
  });
});
