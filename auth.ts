import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        // Demo admin bypass — works without a database connection.
        // Set DEMO_ADMIN_PASSWORD in Vercel env vars to enable.
        const demoPass = process.env.DEMO_ADMIN_PASSWORD;
        if (
          demoPass &&
          email === "admin@daralhalalcertification.com" &&
          password === demoPass
        ) {
          return {
            id: "demo-admin-001",
            name: "Admin",
            email: "admin@daralhalalcertification.com",
            role: "ADMIN",
          };
        }

        // Regular database-backed auth
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;
          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } catch {
          return null;
        }
      },
    }),
  ],
});
