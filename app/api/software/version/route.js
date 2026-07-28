import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    minimumVersion: "5.0.0",
    latestVersion: "5.0.0",
    downloadUrl: "https://github.com/taimurxai/SmartWeb/releases/latest"
  });
}
