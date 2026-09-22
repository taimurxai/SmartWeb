import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

const softwareResultSchema = z.object({
  code: z.string().trim().min(10).max(100),
  status: z.string().trim().toUpperCase(),
});

const ALLOWED_STATUSES = new Set(["SUCCESS", "FAILED", "SUSPICIOUS", "LIVE_CHAT", "IN_REVIEW"]);

export const dynamic = "force-dynamic";

export async function POST(request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.status === "FROZEN") {
    return NextResponse.json({ error: "Account Frozen" }, { status: 403 });
  }

  const rateLimit = await checkRateLimit(`software-results:user:${user.id}`, {
    max: 60,
    windowMs: 60000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const rawBody = await request.json();
    const { code, status } = softwareResultSchema.parse(rawBody);

    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json(
        { error: `Invalid status '${status}'. Must be one of: ${Array.from(ALLOWED_STATUSES).join(", ")}` },
        { status: 400 }
      );
    }

    // Upsert tracking code to ensure it exists and update overrideStatus
    await prisma.trackingCode.upsert({
      where: { code },
      update: { overrideStatus: status },
      create: { code, overrideStatus: status },
    });

    // Create a submission record so it appears in user and admin history
    await prisma.trackingSubmission.create({
      data: {
        userId: user.id,
        code,
      },
    });

    await writeAuditLog({
      actorId: user.id,
      event: `Software submitted result for ${code}: ${status}`,
      level: "info",
    });

    return NextResponse.json({ 
      success: true, 
      message: "Results received successfully." 
    });
  } catch (error) {
    if (error?.issues) {
      return NextResponse.json({ error: "Invalid payload format.", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request payload or processing failed" }, { status: 400 });
  }
}
