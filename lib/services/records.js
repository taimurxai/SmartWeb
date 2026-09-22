import { prisma } from "../db";
import { resolveTrackingStatus } from "../tracking";

const MAX_SCAN = 1000;

export async function getStatusRecords(statusFilter, { page, pageSize, q }) {
  const where = {};
  if (q) {
    const trimmed = q.trim();
    where.OR = [
      { user: { name: { contains: trimmed } } },
      { user: { email: { contains: trimmed } } },
      { code: { contains: trimmed } },
    ];
  }

  // When viewing all attempts, we use 100% DB-level pagination
  if (statusFilter === "attempts") {
    const [total, submissions] = await Promise.all([
      prisma.trackingSubmission.count({ where }),
      prisma.trackingSubmission.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          trackingCode: true,
        },
      }),
    ]);

    const rows = submissions.map((s) => {
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

    return { rows, total };
  }

  // For derived statuses, scan recent submissions efficiently
  const submissions = await prisma.trackingSubmission.findMany({
    where,
    take: MAX_SCAN,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      trackingCode: true,
    },
  });

  const want =
    statusFilter === "inReview"
      ? "IN_REVIEW"
      : statusFilter === "liveChat"
      ? "LIVE_CHAT"
      : statusFilter.toUpperCase();

  const filtered = [];
  for (const s of submissions) {
    const { status, stage } = resolveTrackingStatus(s.trackingCode);
    if (status === want) {
      filtered.push({
        id: s.id,
        userId: s.userId,
        userName: s.user.name,
        email: s.user.email,
        code: s.code,
        status,
        stage,
        time: s.createdAt,
      });
    }
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  return { rows: filtered.slice(start, start + pageSize), total };
}

export async function getLoginRecords({ page, pageSize, q }) {
  const where = { success: true };
  if (q) {
    const trimmed = q.trim();
    where.user = {
      OR: [
        { name: { contains: trimmed } },
        { email: { contains: trimmed } },
      ],
    };
  }

  // 100% DB-level pagination for login records
  const [total, events] = await Promise.all([
    prisma.loginEvent.count({ where }),
    prisma.loginEvent.findMany({
      where,
      orderBy: { time: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const rows = events.map((e) => ({
    id: e.id,
    userId: e.userId,
    userName: e.user.name,
    email: e.user.email,
    time: e.time,
    os: e.os,
    browser: e.browser,
  }));

  return { rows, total };
}
