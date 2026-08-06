import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    minimumVersion: "2026.8.6",
    latestVersion: "2026.8.6",
    downloadUrl: "https://smart-web-blue.vercel.app/downloads/SmartAgeVerification.rar"
  });
}
