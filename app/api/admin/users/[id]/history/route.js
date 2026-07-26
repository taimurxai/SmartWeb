import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/rbac";
import { SAFE_USER_FIELDS } from "@/lib/auth";
import { getUserDailyHistory } from "@/lib/services/history";

export const GET = withAdmin(async (request, { params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id }, select: SAFE_USER_FIELDS });
  if (!user) return NextResponse.json({ error: "ইউজার পাওয়া যায়নি।" }, { status: 404 });

  const lastLogin = await prisma.loginEvent.findFirst({
    where: { userId: id, success: true },
    orderBy: { time: "desc" },
  });

  const { searchParams } = new URL(request.url);
  const history = await getUserDailyHistory(id, {
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
  });

  return NextResponse.json({
    user,
    lastLogin: lastLogin ? { time: lastLogin.time, os: lastLogin.os, browser: lastLogin.browser, ip: lastLogin.ip } : null,
    history,
  });
});
