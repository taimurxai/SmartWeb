import { NextResponse } from "next/server";
import { withAuth } from "@/lib/rbac";
import { getUserDailyHistory } from "@/lib/services/history";

export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const history = await getUserDailyHistory(user.id, {
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
  });
  return NextResponse.json({ history });
});
