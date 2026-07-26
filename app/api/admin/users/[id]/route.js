import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/rbac";
import { updateUserSchema } from "@/lib/validation";
import { SAFE_USER_FIELDS } from "@/lib/auth";
import { updateFirebaseUser, deleteFirebaseUser } from "@/lib/firebaseAuth";
import { writeAuditLog } from "@/lib/audit";

export const PATCH = withAdmin(async (request, { params, user: admin }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  let body;
  try {
    body = updateUserSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ error: "ইনপুট সঠিক নয়।", details: err?.issues }, { status: 400 });
  }

  if (id === admin.id && body.role && body.role !== "ADMIN") {
    return NextResponse.json({ error: "নিজের Role পরিবর্তন করা যাবে না।" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id }, select: { firebaseUid: true } });
  if (!existing) return NextResponse.json({ error: "ইউজার পাওয়া যায়নি।" }, { status: 404 });

  const email = body.email?.toLowerCase();

  try {
    await updateFirebaseUser(existing.firebaseUid, { email, password: body.password });
  } catch (err) {
    if (err.code === "auth/email-already-exists") {
      return NextResponse.json({ error: "এই ইমেইল দিয়ে ইতিমধ্যে একজন ইউজার আছে।" }, { status: 409 });
    }
    throw err;
  }

  const data = { name: body.name, email, role: body.role };
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

  try {
    const updated = await prisma.user.update({ where: { id }, data, select: SAFE_USER_FIELDS });
    await writeAuditLog({ actorId: admin.id, event: `User updated: ${updated.email}`, level: "info" });
    return NextResponse.json({ user: updated });
  } catch (err) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "এই ইমেইল দিয়ে ইতিমধ্যে একজন ইউজার আছে।" }, { status: 409 });
    }
    if (err.code === "P2025") return NextResponse.json({ error: "ইউজার পাওয়া যায়নি।" }, { status: 404 });
    throw err;
  }
});

export const DELETE = withAdmin(async (request, { params, user: admin }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  if (id === admin.id) {
    return NextResponse.json({ error: "নিজের অ্যাকাউন্ট ডিলিট করা যাবে না।" }, { status: 400 });
  }

  try {
    const deleted = await prisma.user.delete({ where: { id } });
    await writeAuditLog({ actorId: admin.id, event: `User deleted: ${deleted.email}`, level: "error" });
    await deleteFirebaseUser(deleted.firebaseUid);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err.code === "P2025") return NextResponse.json({ error: "ইউজার পাওয়া যায়নি।" }, { status: 404 });
    throw err;
  }
});
