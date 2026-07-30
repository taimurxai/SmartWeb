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
      // Upsert tracking code to ensure it exists and update overrideStatus
      await prisma.trackingCode.upsert({
        where: { code: data.code },
        update: { overrideStatus: data.status },
        create: { code: data.code, overrideStatus: data.status },
      });

      // Create a submission record so it appears in user and admin history
      await prisma.trackingSubmission.create({
        data: {
          userId: user.id,
          code: data.code,
        },
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Results received successfully." 
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload or processing failed" }, { status: 400 });
  }
}

