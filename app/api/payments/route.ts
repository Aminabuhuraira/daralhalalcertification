import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const payments = await prisma.payment.findMany({
    where: { userId },
    include: { application: { select: { businessName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ payments });
}
