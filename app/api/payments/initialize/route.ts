import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { initializeTransaction, isPaystackConfigured } from "@/lib/paystack";

const schema = z.object({ paymentId: z.string(), locale: z.string().min(2).max(5).default("en") });

export async function POST(req: Request) {
  if (!isPaystackConfigured()) {
    return NextResponse.json({ error: "Payments are not configured yet. Please contact us directly." }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const email = (session.user as { email?: string }).email;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const payment = await prisma.payment.findUnique({ where: { id: parsed.data.paymentId } });
  if (!payment || payment.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (payment.status !== "PENDING") {
    return NextResponse.json({ error: "This payment is not pending." }, { status: 400 });
  }

  const reference = `DHC-${payment.id}-${Date.now()}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  const transaction = await initializeTransaction({
    email: email || "",
    amountKobo: payment.amount,
    reference,
    callbackUrl: `${siteUrl}/api/payments/callback?locale=${parsed.data.locale}`,
    metadata: { paymentId: payment.id, userId },
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { provider: "paystack", providerRef: reference },
  });

  return NextResponse.json({ authorizationUrl: transaction.authorization_url });
}
