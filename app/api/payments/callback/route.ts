import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyTransaction } from "@/lib/paystack";
import { maybeIssueOnPaymentCompleted } from "@/lib/certificates";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference") || url.searchParams.get("trxref");
  const locale = url.searchParams.get("locale") || "en";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  const redirectTo = (status: string) => NextResponse.redirect(`${siteUrl}/${locale}/dashboard/billing?payment=${status}`);

  if (!reference) return redirectTo("error");

  try {
    const transaction = await verifyTransaction(reference);
    const payment = await prisma.payment.findFirst({ where: { providerRef: reference } });
    if (!payment) return redirectTo("error");

    if (transaction.status === "success") {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "COMPLETED" } });
      await maybeIssueOnPaymentCompleted(payment.applicationId);
      return redirectTo("success");
    }
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return redirectTo("failed");
  } catch {
    return redirectTo("error");
  }
}
