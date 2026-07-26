import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET(request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.status === "FROZEN") {
    return NextResponse.json({ error: "Account Frozen" }, { status: 403 });
  }

  // If we reach here, the user is authenticated and active
  return NextResponse.json({ 
    status: "Verified", 
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
}
