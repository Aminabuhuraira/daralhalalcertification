// Runs once per Node.js process (each Vercel lambda) before any request.
// Ensures the SQLite schema is migrated and demo seed is applied so that
// the first request — including cold-start login attempts — never hits a
// missing-table error.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureDb } = await import("@/lib/db");
    await ensureDb().catch(() => {});
  }
}
