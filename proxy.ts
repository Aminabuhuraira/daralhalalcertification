import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: [
    "en", "ar", "ha", "yo", "ig", "fr", "sw", "id",
    "ms", "tr", "ur", "zh", "es", "pt", "de", "ru",
    "bn", "fa", "so", "wo",
  ],
  defaultLocale: "en",
  localeDetection: true,
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
