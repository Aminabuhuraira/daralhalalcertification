import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensureDb } from "@/lib/db";
import { getPaymentTotals } from "@/lib/admin-dashboard-stats";

export async function GET(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const start = searchParams.get("start");
  const end   = searchParams.get("end");

  await ensureDb();
  const totals = await getPaymentTotals(
    start ? new Date(start) : undefined,
    end   ? new Date(end + "T23:59:59") : undefined,
  );

  return NextResponse.json(totals);
}
