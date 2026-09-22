import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const checks = {
    database: { status: "unknown", latencyMs: null },
    redis: { status: "not_configured", latencyMs: null },
  };

  let isHealthy = true;

  // Check Database
  try {
    const dbStart = Date.now();
    await prisma.user.findFirst({ select: { id: true } });
    checks.database = {
      status: "connected",
      latencyMs: Date.now() - dbStart,
    };
  } catch (err) {
    isHealthy = false;
    checks.database = {
      status: "error",
      error: err.message,
    };
  }

  // Check Redis
  if (redis) {
    try {
      const redisStart = Date.now();
      await redis.ping();
      checks.redis = {
        status: "connected",
        latencyMs: Date.now() - redisStart,
      };
    } catch (err) {
      checks.redis = {
        status: "error",
        error: err.message,
      };
    }
  }

  const statusCode = isHealthy ? 200 : 503;
  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || "development",
      totalLatencyMs: Date.now() - startTime,
      checks,
    },
    { status: statusCode }
  );
}
