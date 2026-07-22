import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Called daily by Vercel Cron (see vercel.json).
// Closes applications that have been in DEFICIENCY_NOTICE for >14 working days (~20 calendar days).
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 20); // 14 working days ≈ 20 calendar days

  const stale = await prisma.certificationApplication.findMany({
    where: { status: "DEFICIENCY_NOTICE", updatedAt: { lt: cutoff } },
    select: { id: true, businessName: true, updatedAt: true },
  });

  let closed = 0;
  for (const app of stale) {
    await prisma.certificationApplication.update({
      where: { id: app.id },
      data: {
        status: "CLOSED_INCOMPLETE",
        reviewNotes: `Auto-closed: Application remained in Deficiency Notice status for more than 14 working days without response (since ${app.updatedAt.toLocaleDateString("en-GB")}).`,
      },
    });
    closed++;
  }

  return NextResponse.json({ closed, checked: stale.length, cutoff: cutoff.toISOString() });
}
