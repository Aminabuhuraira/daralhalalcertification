import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  // Future: persist to a mailing list / send via Resend or similar
  return NextResponse.json({ ok: true, message: "Subscribed successfully" });
}
