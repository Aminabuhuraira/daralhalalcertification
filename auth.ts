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

        // Demo admin bypass — no database needed. Set DEMO_ADMIN_PASSWORD in Vercel env.
        const demoPass = process.env.DEMO_ADMIN_PASSWORD;
        if (demoPass && email === "admin@daralhalalcertification.com" && password === demoPass) {
          return { id: "demo-admin-001", name: "Admin", email: "admin@daralhalalcertification.com", role: "ADMIN" };
        }

        // Demo user bypass — no database needed. Set DEMO_USER_PASSWORD in Vercel env.
        const demoUserPass = process.env.DEMO_USER_PASSWORD;
        if (demoUserPass && email === "user@daralhalalcertification.com" && password === demoUserPass) {
          return { id: "demo-user-001", name: "Demo User", email: "user@daralhalalcertification.com", role: "USER" };
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
