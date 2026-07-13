import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ certId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const role = (session.user as { role?: string }).role;
  const { certId } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id: certId },
    include: { course: true, user: { select: { name: true, email: true } } },
  });
  if (!certificate) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (certificate.userId !== userId && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ certificate });
}
