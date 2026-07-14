import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import fs from "fs";
import path from "path";
import { seedDemoData } from "./demo-seed";

const g = globalThis as unknown as { prisma?: PrismaClient; dbReady?: boolean };

function makePrisma() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:/tmp/demo.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return new PrismaClient({ adapter });
}

export const prisma = g.prisma ?? makePrisma();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;

// Auto-initialize schema when running against a local/tmp SQLite file.
// Runs once per lambda warm-up; no-ops on Turso (tables already exist).
let initPromise: Promise<void> | null = null;

export function ensureDb(): Promise<void> {
  if (g.dbReady) return Promise.resolve();
  if (!initPromise) initPromise = _init();
  return initPromise;
}

async function _init() {
  try {
    await prisma.$queryRawUnsafe("SELECT 1 FROM \"User\" LIMIT 1");
    g.dbReady = true;
    return;
  } catch {
    // Tables don't exist — apply every migration SQL file in order
  }

  const base = path.join(process.cwd(), "prisma", "migrations");
  if (!fs.existsSync(base)) { g.dbReady = true; return; }

  const dirs = fs.readdirSync(base).filter(d => !d.endsWith(".toml")).sort();
  for (const dir of dirs) {
    const sqlFile = path.join(base, dir, "migration.sql");
    if (!fs.existsSync(sqlFile)) continue;
    const sql = fs.readFileSync(sqlFile, "utf-8");
    // Split on semicolons that end a line (avoids splitting inside string literals)
    const stmts = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
    for (const stmt of stmts) {
      try { await prisma.$executeRawUnsafe(stmt); } catch { /* ignore duplicate / already-exists */ }
    }
  }
  g.dbReady = true;

  // Populate with demo data if the database is freshly created
  await seedDemoData(prisma).catch(() => {});
}
