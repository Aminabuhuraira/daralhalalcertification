import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ courses });
}

const createCourseSchema = z.object({
  slug: z.string().min(2).max(80),
  title: z.string().min(2).max(160),
  description: z.string().min(2),
  category: z.string().min(1).max(80),
  level: z.string().min(1).max(40),
  durationLabel: z.string().min(1).max(40),
  published: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createCourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const course = await prisma.course.create({ data: parsed.data });
  return NextResponse.json({ course }, { status: 201 });
}
