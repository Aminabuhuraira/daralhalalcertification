import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const search = new URL(req.url).searchParams.get("q");

  const users = await prisma.user.findMany({
    where: search
      ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
      : undefined,
    select: { id: true, name: true, email: true, role: true, businessName: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}
