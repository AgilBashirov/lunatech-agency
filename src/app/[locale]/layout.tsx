import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { MotionConfigProvider } from "@/components/motion/MotionConfigProvider";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    icons: {
      icon: [
        {
          url: "/32x32_black.svg",
          media: "(prefers-color-scheme: light)",
          type: "image/svg+xml",
        },
        {
          url: "/32x32_white.svg",
          media: "(prefers-color-scheme: dark)",
          type: "image/svg+xml",
        },
        {
          url: "/32x32_black.png",
          media: "(prefers-color-scheme: light)",
          type: "image/png",
          sizes: "32x32",
        },
        {
          url: "/32x32_white.png",
          media: "(prefers-color-scheme: dark)",
          type: "image/png",
          sizes: "32x32",
        },
      ],
      apple: "/64x64_black.png",
    },
    openGraph: {
      title,
      description,
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
