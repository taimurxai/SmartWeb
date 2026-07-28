import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    minimumVersion: "3.0.1",
    latestVersion: "3.0.1",
    downloadUrl: "https://github.com/taimurxai/SmartWeb/releases/latest"
  });
}
