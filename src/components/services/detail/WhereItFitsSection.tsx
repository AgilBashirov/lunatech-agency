import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { ServiceContent } from "@/components/services/detail/ServiceContent";
import { ServiceSection } from "@/components/services/detail/ServiceSection";
import { getServiceBySlug, type ServiceSlug } from "@/lib/services";

const USE_CASE_KEYS = ["uc1", "uc2", "uc3", "uc4", "uc5", "uc6"] as const;

export async function WhereItFitsSection({ slug }: { slug: ServiceSlug }) {
  const definition = getServiceBySlug(slug);
  if (!definition) return null;

  const t = await getTranslations(`services.detail.${slug}.useCases`);
  const tShared = await getTranslations("services.detail.shared");
  const items = USE_CASE_KEYS.slice(0, definition.counts.useCases);

  const rows = items.map((key) => ({
    title: t(`${key}.title`),
    description: t(`${key}.description`),
  }));

  return (
    <ServiceSection
      id="where-it-fits"
      headingId="usecases"
      title={tShared("whereItFits")}
      width="wide"
    >
      <Reveal>
        <ServiceContent.List items={rows} />
      </Reveal>
    </ServiceSection>
  );
}
