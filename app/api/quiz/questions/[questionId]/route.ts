import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ questionId: string }> };

const updateQuestionSchema = z.object({
  text: z.string().min(1).optional(),
  options: z.array(z.string().min(1)).min(2).max(8).optional(),
  correctIndex: z.number().int().min(0).optional(),
  explanation: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { questionId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }
  const { options, ...rest } = parsed.data;
  const question = await prisma.question.update({
    where: { id: questionId },
    data: { ...rest, ...(options ? { options: JSON.stringify(options) } : {}) },
  });
  return NextResponse.json({ question });
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { questionId } = await params;
  await prisma.question.delete({ where: { id: questionId } });
  return NextResponse.json({ ok: true });
}
