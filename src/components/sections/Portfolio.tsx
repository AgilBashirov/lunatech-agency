import { PortfolioSection } from "@/components/portfolio/PortfolioSection";
import type { PortfolioItem } from "@/lib/admin/types";

type Props = {
  items: PortfolioItem[];
};

export function Portfolio({ items }: Props) {
  return <PortfolioSection items={items} />;
}
