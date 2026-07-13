import { config } from "dotenv";
import { defineConfig } from "@prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // fallback keeps `prisma generate` working at build time without DATABASE_URL set
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
