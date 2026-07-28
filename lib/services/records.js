import { prisma } from "../db";
import { resolveTrackingStatus } from "../tracking";

// Status is derived per-row (not a stored column), so it can't be filtered
// or paginated in SQL directly. We scan the most recent submissions, compute
// status in memory, then filter/paginate. Fine at this app's real scale (an
// internal tracking tool, not millions of rows); if that ever changes, add a
// background job that denormalizes status onto a column and paginate that
// instead.
const MAX_SCAN = 5000;

export async function getStatusRecords(statusFilter, { page, pageSize, q }) {
  const submissions = await prisma.trackingSubmission.findMany({
    take: MAX_SCAN,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      trackingCode: true,
    },
  });

  let rows = submissions.map((s) => {
    const { status, stage } = resolveTrackingStatus(s.trackingCode);
    return {
      id: s.id,
      userId: s.userId,
      userName: s.user.name,
      email: s.user.email,
      code: s.code,
      status,
      stage,
      time: s.createdAt,
    };
  });

  if (statusFilter !== "attempts") {
    const want = statusFilter === "inReview" ? "IN_REVIEW" : statusFilter === "liveChat" ? "LIVE_CHAT" : statusFilter.toUpperCase();
    rows = rows.filter((r) => r.status === want);
  }
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter(
      (r) => r.userName.toLowerCase().includes(needle) || r.email.toLowerCase().includes(needle)
    );
  }

  const total = rows.length;
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total };
}

export async function getLoginRecords({ page, pageSize, q }) {
  const events = await prisma.loginEvent.findMany({
    where: { success: true },
    orderBy: { time: "desc" },
    take: MAX_SCAN,
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  let rows = events.map((e) => ({
    id: e.id,
    userId: e.userId,
    userName: e.user.name,
    email: e.user.email,
    time: e.time,
    os: e.os,
    browser: e.browser,
  }));

  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter(
      (r) => r.userName.toLowerCase().includes(needle) || r.email.toLowerCase().includes(needle)
    );
  }

  const total = rows.length;
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total };
}
