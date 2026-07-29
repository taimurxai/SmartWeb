import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const updateStatus = searchParams.get("update");

  if (!code || !updateStatus) {
    return NextResponse.json(
      { error: "Missing 'code' or 'update' query parameters." },
      { status: 400 }
    );
  }

  // Map incoming statuses to the Prisma schema TrackingStatus enum
  let mappedStatus = null;
  const upperStatus = updateStatus.toUpperCase();

  if (upperStatus === "PASSED_PENDING_PAY" || upperStatus === "PASSED" || upperStatus === "SUCCESS") {
    mappedStatus = "SUCCESS";
  } else if (upperStatus === "FAILED") {
    mappedStatus = "FAILED";
  } else if (upperStatus === "SUSPICIOUS") {
    mappedStatus = "SUSPICIOUS";
  } else if (upperStatus === "LIVE_CHAT" || upperStatus === "LIVECHAT") {
    mappedStatus = "LIVE_CHAT";
  }

  if (!mappedStatus) {
    // If the status is not a terminal one or unrecognized, we might not want to override
    return NextResponse.json(
      { success: true, message: `Status '${updateStatus}' received but ignored (not a final state).` }
    );
  }

  try {
    // Upsert or update the tracking code with the override status
    await prisma.trackingCode.upsert({
      where: { code },
      update: { overrideStatus: mappedStatus },
      create: { code, overrideStatus: mappedStatus },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated tracking code ${code} to ${mappedStatus}.`,
    });
  } catch (error) {
    console.error("Webhook update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
