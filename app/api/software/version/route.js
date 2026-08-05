import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    minimumVersion: "26.8.5",
    latestVersion: "26.8.5",
    downloadUrl: "https://github.com/taimurxai/SmartWeb/releases/latest"
  });
}
