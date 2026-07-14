import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const url    = new URL(req.url);
  const status = url.searchParams.get("status");
  const q      = url.searchParams.get("q") ?? "";

  const applications = await prisma.certificationApplication.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(q ? {
        OR: [
          { businessName:    { contains: q } },
          { referenceNumber: { contains: q } },
          { schemeCode:      { contains: q } },
        ],
      } : {}),
    },
    include: { user: { select: { name: true, email: true } }, payments: true, certificate: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ applications });
}

const createApplicationSchema = z.object({
  businessName:    z.string().min(1).max(160),
  sector:          z.string().min(1).max(120),
  schemeCode:      z.enum(["FB", "FP", "AQ", "SL", "CS", "PH", "CG", "LG"]).optional(),
  productionScale: z.enum(["LARGE", "MEDIUM", "SMALL"]).optional(),
  productList:     z.string().min(1),
  notes:           z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const body = await req.json().catch(() => null);
  const parsed = createApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const application = await prisma.certificationApplication.create({
    data: { userId, ...parsed.data, status: "SUBMITTED" },
  });
  return NextResponse.json({ application }, { status: 201 });
}
