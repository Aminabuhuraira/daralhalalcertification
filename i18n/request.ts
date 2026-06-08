import { getRequestConfig } from "next-intl/server";

const locales = ["en","ar","ha","yo","ig","fr","sw","id","ms","tr","ur","zh","es","pt","de","ru","bn","fa","so","wo"];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || "en";
  const validLocale = locales.includes(locale) ? locale : "en";

  let messages;
  try {
    messages = (await import(`../lib/messages/${validLocale}.json`)).default;
  } catch {
    messages = (await import(`../lib/messages/en.json`)).default;
  }

  return { locale: validLocale, messages };
});
