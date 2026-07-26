import { NextResponse } from "next/server";
import { withAuth } from "@/lib/rbac";

export const GET = withAuth(async (request, { user }) => {
  return NextResponse.json({ user });
});
