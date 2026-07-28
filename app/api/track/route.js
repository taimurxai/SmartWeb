import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/rbac";
import { trackCodeSchema } from "@/lib/validation";
import { normalizeCode, resolveTrackingStatus } from "@/lib/tracking";
import { writeAuditLog } from "@/lib/audit";

export const POST = withAuth(async (request, { user }) => {
  let body;
  try {
    body = trackCodeSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid tracking code format." }, { status: 400 });
  }

  const code = normalizeCode(body.input);
  if (code.length < 15 || code.length > 16) {
    return NextResponse.json({ error: "Code must be 15 or 16 alphanumeric characters." }, { status: 400 });
  }

  const trackingCode = await prisma.trackingCode.upsert({
    where: { code },
    update: {},
    create: { code },
  });

  await prisma.trackingSubmission.create({ data: { userId: user.id, code } });
  await writeAuditLog({ actorId: user.id, event: `Tracking code submitted (${code})`, level: "info" });

  const { status, stage } = resolveTrackingStatus(trackingCode);
  const updatedAt = new Date().toISOString();


  return NextResponse.json({ code, status, stage, updatedAt });
});
