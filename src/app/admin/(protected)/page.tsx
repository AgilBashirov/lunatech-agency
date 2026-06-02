import Link from "next/link";
import { getAdminSession } from "@/lib/admin/session";

// ---------------------------------------------------------------------------
// Dashboard section cards
// ---------------------------------------------------------------------------

type SectionCard = {
  label: string;
  description: string;
  href: string;
};

const SECTION_CARDS: SectionCard[] = [
  {
    label: "Xidmətlər",
    description: "Xidmət məzmununu idarə et",
    href: "/admin/services",
  },
  {
    label: "Məzmun (az/en/ru)",
    description: "Çoxdilli interfeys mətnlərini redaktə et",
    href: "/admin/messages",
  },
  {
    label: "Portfolio",
    description: "Portfolio layihələrini idarə et",
    href: "/admin/portfolio",
  },
  {
    label: "Blog",
    description: "Blog yazılarını yaz və yayımla",
    href: "/admin/blog",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white mb-1">Dashboard</h1>
        <p className="text-sm" style={{ color: "rgba(244,244,245,0.5)" }}>
          Xoş gəldiniz
          {session ? (
            <>,{" "}
              <span style={{ color: "rgba(244,244,245,0.8)" }}>
                {session.username}
              </span>
            </>
          ) : null}
          .
        </p>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTION_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex items-start gap-4 rounded-xl border p-5 transition-colors hover:border-white/15"
            style={{
              background: "#1a1a1a",
              borderColor: "rgba(255,255,255,0.07)",
            }}
          >
            <div>
              <p className="text-sm font-medium text-white mb-0.5">
                {card.label}
              </p>
              <p className="text-xs" style={{ color: "rgba(244,244,245,0.45)" }}>
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
