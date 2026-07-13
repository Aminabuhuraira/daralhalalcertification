import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  businessName: z.string().max(160).optional(),
  sector: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(72).optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const body = await req.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const { currentPassword, newPassword, ...profileFields } = parsed.data;

  const data: Record<string, string> = {};
  for (const [key, value] of Object.entries(profileFields)) {
    if (value !== undefined) data[key] = value;
  }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required to set a new password." }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    data.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, businessName: true, sector: true, phone: true, role: true },
  });

  return NextResponse.json({ user });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  // Require email confirmation in body
  const body = await req.json().catch(() => null);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (body?.email !== user.email) {
    return NextResponse.json({ error: "Email confirmation does not match." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
