import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { routing } from "@/i18n/routing";
import { buildLegalMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildLegalMetadata("terms", "/terms", locale);
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "terms" });

  return (
    <LegalPageLayout
      title={t("title")}
      updated={t("updated")}
      intro={t("intro")}
      sections={[
        { heading: t("acceptanceTitle"), body: t("acceptanceBody") },
        { heading: t("servicesTitle"), body: t("servicesBody") },
        { heading: t("ipTitle"), body: t("ipBody") },
        { heading: t("liabilityTitle"), body: t("liabilityBody") },
        { heading: t("changesTitle"), body: t("changesBody") },
        { heading: t("lawTitle"), body: t("lawBody") },
        { heading: t("contactTitle"), body: t("contactBody") },
      ]}
    />
  );
}
