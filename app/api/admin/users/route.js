import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/rbac";
import { addUserSchema } from "@/lib/validation";
import { SAFE_USER_FIELDS } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { writeAuditLog } from "@/lib/audit";

const SORTABLE = ["name", "email", "role", "status", "createdAt"];

// This app is an internal admin tool (expected user counts in the hundreds,
// not millions), so fetching the full user list and sorting/filtering it in
// memory keeps search case-insensitive and simple across SQLite and Postgres
// alike, rather than branching on provider-specific ILIKE support.
export const GET = withAdmin(async (request) => {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10) || 10));
  const sortParam = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const sort = SORTABLE.includes(sortParam) ? sortParam : "createdAt";

  const all = await prisma.user.findMany({ select: SAFE_USER_FIELDS });

  let rows = q
    ? all.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    : all;

  rows = [...rows].sort((a, b) => {
    const av = a[sort];
    const bv = b[sort];
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return order === "asc" ? cmp : -cmp;
  });

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const paged = rows.slice(start, start + pageSize);

  return NextResponse.json({ users: paged, total, page, pageSize });
});

export const POST = withAdmin(async (request, { user: admin }) => {
  let body;
  try {
    body = addUserSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: "ইনপুট সঠিক নয়।", details: err?.issues }, { status: 400 });
  }

  const email = body.email.toLowerCase();
  const hashedPassword = await bcrypt.hash(body.password, 10);

  try {
    const created = await prisma.user.create({
      data: { name: body.name, email, role: body.role, password: hashedPassword },
      select: SAFE_USER_FIELDS,
    });
    await writeAuditLog({ actorId: admin.id, event: `User created: ${email}`, level: "info" });
    return NextResponse.json({ user: created }, { status: 201 });
  } catch (err) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "এই ইমেইল দিয়ে ইতিমধ্যে একজন ইউজার আছে।" }, { status: 409 });
    }
    throw err;
  }
});
