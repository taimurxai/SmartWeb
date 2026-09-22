import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/device";
import { writeAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

function mapStatus(updateStatus) {
  if (!updateStatus) return null;
  const upper = updateStatus.toUpperCase().trim();
  if (upper === "PASSED_PENDING_PAY" || upper === "PASSED" || upper === "SUCCESS") {
    return "SUCCESS";
  }
  if (upper === "FAILED") {
    return "FAILED";
  }
  if (upper === "SUSPICIOUS") {
    return "SUSPICIOUS";
  }
  if (upper === "LIVE_CHAT" || upper === "LIVECHAT") {
    return "LIVE_CHAT";
  }
  return null;
}

function verifySecret(request, bodySecret, querySecret) {
  const apiKeyHeader = request.headers.get("x-api-key");
  const provided = apiKeyHeader || bodySecret || querySecret;
  if (!provided) return false;

  const expected = process.env.WEBHOOK_SECRET;
  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      console.error("CRITICAL: WEBHOOK_SECRET is not configured in production environment!");
      return false;
    }
    return provided === "smartweb_webhook_secret_key_2026";
  }
  return provided === expected;
}

async function handleUpdate({ request, code, updateStatus, secret }) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`update:ip:${ip}`, { max: 60, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many update requests. Please slow down." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret") || searchParams.get("apiKey");

  if (!verifySecret(request, secret, querySecret)) {
    await writeAuditLog({
      event: `Unauthorized update attempt for code ${code || "unknown"} from IP ${ip}`,
      level: "warn",
    });
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing API key." },
      { status: 401 }
    );
  }

  if (!code || !updateStatus) {
    return NextResponse.json(
      { error: "Missing required 'code' or 'update' parameters." },
      { status: 400 }
    );
  }

  const trimmedCode = String(code).trim();
  if (trimmedCode.length < 10 || trimmedCode.length > 100) {
    return NextResponse.json(
      { error: "Invalid code length." },
      { status: 400 }
    );
  }

  const mappedStatus = mapStatus(updateStatus);
  if (!mappedStatus) {
    return NextResponse.json({
      success: true,
      message: `Status '${updateStatus}' received but ignored (not a terminal state).`,
    });
  }

  try {
    await prisma.trackingCode.upsert({
      where: { code: trimmedCode },
      update: { overrideStatus: mappedStatus },
      create: { code: trimmedCode, overrideStatus: mappedStatus },
    });

    await writeAuditLog({
      event: `Tracking code ${trimmedCode} status updated to ${mappedStatus} via webhook`,
      level: "info",
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated tracking code ${trimmedCode} to ${mappedStatus}.`,
    });
  } catch (error) {
    console.error("Webhook update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST is the primary, secure method for webhook updates
export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  return handleUpdate({
    request,
    code: body.code,
    updateStatus: body.update || body.status,
    secret: body.secret || body.apiKey,
  });
}

// GET is maintained for backward compatibility with existing clients, but strictly requires secret
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const updateStatus = searchParams.get("update");
  const secret = searchParams.get("secret") || searchParams.get("apiKey");

  return handleUpdate({
    request,
    code,
    updateStatus,
    secret,
  });
}
