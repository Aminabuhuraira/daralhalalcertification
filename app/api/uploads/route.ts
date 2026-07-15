import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const UPLOAD_DIR = "/tmp/dahc-uploads";
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg", "image/png", "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const appId = formData.get("appId") as string | null;
  const file  = formData.get("file") as File | null;

  if (!appId || !file) {
    return NextResponse.json({ error: "appId and file are required" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  // Verify the user owns this application (or is an admin)
  const role = (session.user as { role?: string }).role;
  const app  = await prisma.certificationApplication.findUnique({ where: { id: appId } });
  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  if (app.userId !== userId && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Save file to /tmp
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const safeBase = file.name.replace(/[^a-z0-9._-]/gi, "_").slice(0, 120);
  const fileName = `${appId}-${Date.now()}-${safeBase}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const buffer   = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Parse existing documents list and append
  const existing: Array<{ name: string; fileName: string; size: number; uploadedAt: string }> =
    app.documents ? JSON.parse(app.documents) : [];
  existing.push({ name: file.name, fileName, size: file.size, uploadedAt: new Date().toISOString() });

  await prisma.certificationApplication.update({
    where: { id: appId },
    data:  { documents: JSON.stringify(existing) },
  });

  return NextResponse.json({ ok: true, fileName, name: file.name });
}
