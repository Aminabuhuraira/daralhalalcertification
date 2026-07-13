import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/auth.config";

const LOCALES = [
  "en", "ar", "ha", "yo", "ig", "fr", "sw", "id",
  "ms", "tr", "ur", "zh", "es", "pt", "de", "ru",
  "bn", "fa", "so", "wo",
];

const intlMiddleware = createIntlMiddleware({
  locales: LOCALES,
  defaultLocale: "en",
  localeDetection: true,
});

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/reviewer"];
const STAFF_ROLES = ["ADMIN", "REVIEWER", "INSPECTOR"] as const;

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  const isProtected = PROTECTED_PREFIXES.some((p) => withoutLocale.startsWith(p));
  const isAdminRoute   = withoutLocale.startsWith("/admin");
  const isReviewerRoute = withoutLocale.startsWith("/reviewer");
  const firstSegment = pathname.split("/")[1];
  const locale = firstSegment && LOCALES.includes(firstSegment) ? firstSegment : "en";

  if (isProtected) {
    if (!req.auth?.user) {
      const loginUrl = new URL(`/${locale}/auth/login`, req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const role = (req.auth.user as { role?: string }).role ?? "";
    if (isAdminRoute && role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }
    if (isReviewerRoute && !(STAFF_ROLES as readonly string[]).includes(role)) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
