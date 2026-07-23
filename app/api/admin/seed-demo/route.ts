import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensureDb, prisma } from "@/lib/db";
import { seedDemoData } from "@/lib/demo-seed";

// One-click way to populate the live/deployed database with the realistic
// demo dataset (21 companies across every pipeline stage, courses, payments,
// certificates) for testing. Safe to call repeatedly — seedDemoData() no-ops
// once any CertificationApplication row already exists.
export async function POST() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureDb();
  const before = await prisma.certificationApplication.count().catch(() => 0);
  if (before > 0) {
    return NextResponse.json({ ok: true, seeded: false, message: "Demo data already present — nothing to do." });
  }

  await seedDemoData(prisma);
  const after = await prisma.certificationApplication.count().catch(() => 0);
  return NextResponse.json({ ok: true, seeded: after > 0, applications: after });
}
