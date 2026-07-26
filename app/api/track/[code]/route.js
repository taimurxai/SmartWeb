import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/rbac";
import { resolveTrackingStatus, publishTrackingStatus } from "@/lib/tracking";

export const GET = withAuth(async (request, { params }) => {
  const trackingCode = await prisma.trackingCode.findUnique({ where: { code: params.code } });
  if (!trackingCode) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { status, stage } = resolveTrackingStatus(trackingCode);
  const updatedAt = new Date().toISOString();
  await publishTrackingStatus(trackingCode.code, { status, stage, updatedAt });

  return NextResponse.json({ code: trackingCode.code, status, stage, updatedAt });
});
