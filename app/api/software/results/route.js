import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // Handle results coming from the software apps
    if (data.code && data.status) {
      if (["SUSPICIOUS", "LIVE_CHAT"].includes(data.status)) {
        await prisma.trackingCode.update({
          where: { code: data.code },
          data: { overrideStatus: data.status }
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Results received successfully." 
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
