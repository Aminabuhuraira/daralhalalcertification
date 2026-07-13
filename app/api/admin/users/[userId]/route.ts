import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ userId: string }> };

const updateSchema = z.object({ role: z.enum(["USER", "REVIEWER", "INSPECTOR", "ADMIN"]) });

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { userId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json({ user });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { userId } = await params;

  // Prevent admin from deleting themselves
  if ((session.user as { id?: string }).id === userId) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
