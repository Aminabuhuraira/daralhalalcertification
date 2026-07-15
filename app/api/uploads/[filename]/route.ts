import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const UPLOAD_DIR = "/tmp/dahc-uploads";

type Params = { params: Promise<{ filename: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const role   = (session.user as { role?: string }).role;

  const { filename } = await params;
  const safeName = path.basename(filename);
  const filePath = path.join(UPLOAD_DIR, safeName);

  // Extract appId from filename prefix (format: <appId>-<timestamp>-<original>)
  const appId = safeName.split("-").slice(0, 5).join("-"); // cuid is 25 chars
  // More precise: split on first two dashes-timestamp pattern
  // filename = "<appId>-<timestamp>-<original>" where appId is the first segment of unknown length
  // We'll just verify the file belongs to an app the user owns
  const app = await prisma.certificationApplication.findFirst({
    where: { documents: { contains: safeName } },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.userId !== userId && role !== "ADMIN" && role !== "REVIEWER" && role !== "INSPECTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Read file
  const buffer = await fs.readFile(filePath).catch(() => null);
  if (!buffer) return NextResponse.json({ error: "File not found on server" }, { status: 404 });

  // Guess content type from extension
  const ext = path.extname(safeName).toLowerCase();
  const mime: Record<string, string> = {
    ".pdf":  "application/pdf",
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png":  "image/png",
    ".webp": "image/webp",
    ".doc":  "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":        mime[ext] ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${safeName}"`,
    },
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const role   = (session.user as { role?: string }).role;

  const { filename } = await params;
  const safeName = path.basename(filename);

  const app = await prisma.certificationApplication.findFirst({
    where: { documents: { contains: safeName } },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.userId !== userId && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Remove from documents list
  const docs: Array<{ fileName: string }> = app.documents ? JSON.parse(app.documents) : [];
  const updated = docs.filter(d => d.fileName !== safeName);
  await prisma.certificationApplication.update({
    where: { id: app.id },
    data:  { documents: updated.length ? JSON.stringify(updated) : null },
  });

  // Best-effort delete from disk
  await fs.unlink(path.join(UPLOAD_DIR, safeName)).catch(() => {});
  return NextResponse.json({ ok: true });
}
