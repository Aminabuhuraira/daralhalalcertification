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

// All routes that require authentication
const PROTECTED_PREFIXES  = ["/dashboard", "/admin", "/reviewer", "/inspector", "/ops", "/technical", "/sharia"];

// Role → allowed route prefixes (checked for non-admin staff)
const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN:              ["/admin", "/dashboard", "/reviewer", "/inspector", "/ops", "/technical", "/sharia"],
  SUPER_ADMIN:        ["/admin", "/dashboard", "/reviewer", "/inspector", "/ops", "/technical", "/sharia"],
  REVIEWER:           ["/reviewer", "/dashboard"],
  OPERATIONS_MANAGER: ["/ops", "/dashboard"],
  INSPECTOR:          ["/inspector", "/dashboard"],
  TECHNICAL:          ["/technical", "/dashboard"],
  SHARIA_PANEL:       ["/sharia", "/dashboard"],
  USER:               ["/dashboard"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  const isProtected = PROTECTED_PREFIXES.some((p) => withoutLocale.startsWith(p));
  const firstSegment = pathname.split("/")[1];
  const locale = firstSegment && LOCALES.includes(firstSegment) ? firstSegment : "en";

  if (isProtected) {
    if (!req.auth?.user) {
      const loginUrl = new URL(`/${locale}/auth/login`, req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (req.auth.user as { role?: string }).role ?? "USER";
    const allowedPrefixes = ROLE_ROUTES[role] ?? ["/dashboard"];

    // Check if the current route is allowed for this role
    const routeAllowed = allowedPrefixes.some(p => withoutLocale.startsWith(p));
    if (!routeAllowed) {
      // Redirect to the role's primary portal
      const primary = allowedPrefixes[0] ?? "/dashboard";
      return NextResponse.redirect(new URL(`/${locale}${primary}`, req.url));
    }
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
