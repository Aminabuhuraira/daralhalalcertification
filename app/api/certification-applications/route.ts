import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const STAFF_ROLES = new Set(["ADMIN", "SUPER_ADMIN", "REVIEWER", "OPERATIONS_MANAGER", "INSPECTOR", "TECHNICAL", "SHARIA_PANEL"]);

export async function GET(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "";
  if (!session?.user || !STAFF_ROLES.has(role)) {
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
          { businessName:     { contains: q } },
          { applicationNumber:{ contains: q } },
          { referenceNumber:  { contains: q } },
          { schemeCode:       { contains: q } },
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

async function generateApplicationNumber(): Promise<string> {
  const year = String(new Date().getFullYear()).slice(-2);
  const count = await prisma.certificationApplication.count();
  return `DAHC/APP/${year}/${String(count + 1).padStart(4, "0")}`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const body = await req.json().catch(() => null);
  const parsed = createApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const applicationNumber = await generateApplicationNumber();
  const application = await prisma.certificationApplication.create({
    data: { userId, ...parsed.data, applicationNumber, status: "DRAFT" },
  });
  return NextResponse.json({ application }, { status: 201 });
}
