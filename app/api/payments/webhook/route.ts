import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { maybeIssueOnPaymentCompleted } from "@/lib/certificates";

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  if (!signature || signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  if (event.event === "charge.success") {
    const reference = event.data?.reference;
    if (reference) {
      const payment = await prisma.payment.findFirst({ where: { providerRef: reference } });
      if (payment && payment.status !== "COMPLETED") {
        await prisma.payment.update({ where: { id: payment.id }, data: { status: "COMPLETED" } });
        await maybeIssueOnPaymentCompleted(payment.applicationId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
