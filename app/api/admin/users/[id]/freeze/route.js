import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";

export const POST = withAdmin(async (request, { params, user: admin }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  if (id === admin.id) {
    return NextResponse.json({ error: "নিজের অ্যাকাউন্ট ফ্রিজ করা যাবে না।" }, { status: 400 });
  }

  const updated = await prisma.user.update({ where: { id }, data: { status: "FROZEN" } }).catch(() => null);
  if (!updated) return NextResponse.json({ error: "ইউজার পাওয়া যায়নি।" }, { status: 404 });

  // getSessionUser() already blocks a frozen user on their next request, but
  // dropping existing sessions here means any request already in flight
  // can't slip through on a session row that hasn't been re-checked yet.
  await prisma.session.deleteMany({ where: { userId: id } });
  await writeAuditLog({ actorId: admin.id, event: `User frozen: ${updated.email}`, level: "error" });

  return NextResponse.json({ ok: true });
});
