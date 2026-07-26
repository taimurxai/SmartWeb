import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/rbac";
import { getStatusRecords, getLoginRecords } from "@/lib/services/records";

const TYPES = ["logins", "attempts", "success", "failed", "inReview"];

export const GET = withAdmin(async (request) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  if (!TYPES.includes(type)) return NextResponse.json({ error: "Invalid type." }, { status: 400 });

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10) || 10));
  const q = searchParams.get("q") || "";

  const result =
    type === "logins"
      ? await getLoginRecords({ page, pageSize, q })
      : await getStatusRecords(type, { page, pageSize, q });

  return NextResponse.json({ ...result, page, pageSize });
});
