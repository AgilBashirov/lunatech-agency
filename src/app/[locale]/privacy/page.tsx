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
  return buildLegalMetadata("privacy", "/privacy", locale);
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "privacy" });

  return (
    <LegalPageLayout
      title={t("title")}
      updated={t("updated")}
      intro={t("intro")}
      sections={[
        { heading: t("collectionTitle"), body: t("collectionBody") },
        { heading: t("useTitle"), body: t("useBody") },
        { heading: t("sharingTitle"), body: t("sharingBody") },
        { heading: t("cookiesTitle"), body: t("cookiesBody") },
        { heading: t("retentionTitle"), body: t("retentionBody") },
        { heading: t("rightsTitle"), body: t("rightsBody") },
        { heading: t("contactTitle"), body: t("contactBody") },
      ]}
    />
  );
}
