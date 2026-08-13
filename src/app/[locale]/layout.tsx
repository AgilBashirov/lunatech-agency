import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { MotionConfigProvider } from "@/components/motion/MotionConfigProvider";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/services";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Base metadata for every route under `[locale]`. Deeper routes (blog,
 * services) supply their own `generateMetadata` with more specific
 * canonical/alternates and override these fields — this layer's
 * canonical/languages therefore end up applying to the home page, which has
 * no `generateMetadata` of its own.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("title");
  const description = t("description");

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/${locale}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${siteUrl}/${l}`;
  }

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale,
      type: "website",
      siteName: "Lunatech",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Locale-scoped layout. <html> and <body> live in the root layout
 * (`src/app/layout.tsx`) per Next.js 16's requirement; this layer is
 * responsible only for locale validation, calling `setRequestLocale` so
 * server-rendered translations resolve correctly during static generation,
 * and providing the i18n client provider for descendants.
 */
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <MotionConfigProvider>
        <SmoothScroll>{children}</SmoothScroll>
      </MotionConfigProvider>
    </NextIntlClientProvider>
  );
}
