import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const certificates = await prisma.certificate.findMany({
    where: { userId },
    include: { course: true },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json({ certificates });
}
