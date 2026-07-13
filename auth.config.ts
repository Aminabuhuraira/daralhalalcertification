import NextAuth, { type NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/auth/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = (user as { id?: string }).id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { role?: string; id?: string }).role =
          token.role as string;
        (session.user as typeof session.user & { role?: string; id?: string }).id =
          token.id as string;
      }
      return session;
    },
  },
};

// Edge-safe instance (no Credentials provider, no Prisma) — used only by proxy.ts
// for the optimistic JWT-cookie check ahead of route protection.
export const { auth } = NextAuth(authConfig);
