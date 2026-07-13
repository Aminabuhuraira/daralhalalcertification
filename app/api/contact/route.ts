import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const contactSchema = z.object({
  name: z.string().min(1).max(160),
  email: z.string().email().max(160),
  inquiry: z.string().max(80).optional(),
  message: z.string().min(1).max(4000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const contactMessage = await prisma.contactMessage.create({ data: parsed.data });
  return NextResponse.json({ contactMessage }, { status: 201 });
}
