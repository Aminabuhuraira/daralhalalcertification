import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

function requireAdmin() {
  return auth().then((s) =>
    (s?.user as { role?: string })?.role === "ADMIN" ? s : null
  );
}

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "REVIEWER" && role !== "INSPECTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const settings = await prisma.platformSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  return NextResponse.json({ settings: map });
}

const updateSchema = z.record(z.string(), z.string());

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const ops = Object.entries(parsed.data).map(([key, value]) =>
    prisma.platformSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    })
  );
  await prisma.$transaction(ops);
  return NextResponse.json({ ok: true });
}
