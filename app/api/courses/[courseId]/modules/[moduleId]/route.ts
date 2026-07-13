import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ courseId: string; moduleId: string }> };

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  order: z.number().int().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { moduleId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const mod = await prisma.module.update({
    where: { id: moduleId },
    data: parsed.data,
  }).catch(() => null);

  if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });
  return NextResponse.json(mod);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { moduleId } = await params;

  await prisma.module.delete({ where: { id: moduleId } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
