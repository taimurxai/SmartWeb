import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/rbac";

export const GET = withAdmin(async (request) => {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10) || 20));
  const level = searchParams.get("level");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where = {
    ...(level ? { level } : {}),
    ...(from || to
      ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } }
      : {}),
  };

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { actor: { select: { name: true, email: true } } },
    }),
  ]);

  const rows = logs.map((l) => ({
    id: l.id,
    time: l.createdAt,
    actor: l.actor?.email || "system",
    event: l.event,
    level: l.level,
  }));

  return NextResponse.json({ logs: rows, total, page, pageSize });
});
