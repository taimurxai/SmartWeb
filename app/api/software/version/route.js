import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    minimumVersion: "2026.8.6",
    latestVersion: "2026.8.6",
    downloadUrl: "https://github.com/taimurxai/SmartWeb/releases/latest"
  });
}
