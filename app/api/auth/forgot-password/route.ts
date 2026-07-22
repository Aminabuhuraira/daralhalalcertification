import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { emailPasswordReset } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const { email } = parsed.data;

  // Always respond with success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://daralhalalcertification.com";
    const resetUrl = `${siteUrl}/en/auth/reset-password?token=${token}`;
    await emailPasswordReset(email, user.name, resetUrl).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
