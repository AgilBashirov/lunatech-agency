import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getMessages as getBlobMessages } from "@/lib/admin/contentStore";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Attempt to load from Blob storage (admin-editable copy).
  // getBlobMessages never throws — it falls back to the static bundle
  // automatically when Blob is unavailable or the file is absent.
  // We do NOT use unstable_cache here so that admin changes are reflected
  // on every request without a revalidation delay.
  const blobMessages = await getBlobMessages(locale);

  return {
    locale,
    messages: blobMessages,
  };
});
