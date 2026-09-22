import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const origin = host ? `${proto}://${host}` : "";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || origin || "https://smart-web-blue.vercel.app";

  return NextResponse.json({
    minimumVersion: "2026.8.6",
    latestVersion: "2026.8.6",
    downloadUrl: `${baseUrl}/downloads/SmartAgeVerification.rar`,
  });
}
