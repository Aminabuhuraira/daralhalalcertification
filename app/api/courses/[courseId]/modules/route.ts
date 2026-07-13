import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ courseId: string }> };

const createModuleSchema = z.object({
  title: z.string().min(1).max(160),
  order: z.number().int().min(0).optional(),
});

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { courseId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = createModuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  let order = parsed.data.order;
  if (order === undefined) {
    const count = await prisma.module.count({ where: { courseId } });
    order = count;
  }

  const moduleRow = await prisma.module.create({
    data: { courseId, title: parsed.data.title, order },
  });
  return NextResponse.json({ module: moduleRow }, { status: 201 });
}
