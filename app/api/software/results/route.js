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
    
    // Here you can handle the results coming from the software.
    // For now we just log it or return a success message.
    // If you need to save it to a specific Prisma model, you can add it here.
    
    return NextResponse.json({ 
      success: true, 
      message: "Results received successfully." 
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
