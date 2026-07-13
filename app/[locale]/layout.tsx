import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import DARIChatbot from "@/components/features/DARIChatbot";
import SessionProvider from "@/components/layout/SessionProvider";

const locales = [
  "en","ar","ha","yo","ig","fr","sw","id",
  "ms","tr","ur","zh","es","pt","de","ru",
  "bn","fa","so","wo",
];

const rtlLocales = ["ar","ur","fa"];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  let messages = {};
  try {
    messages = (await import(`../../lib/messages/${locale}.json`)).default;
  } catch {
    try {
      messages = (await import(`../../lib/messages/en.json`)).default;
    } catch {
      messages = {};
    }
  }

  const isRTL = rtlLocales.includes(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SessionProvider>
        <div dir={isRTL ? "rtl" : "ltr"} lang={locale}>
          {children}
          <DARIChatbot />
        </div>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
