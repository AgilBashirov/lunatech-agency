/**
 * Public blog listing page — /[locale]/blog
 *
 * Server component. Fetches published posts and renders a responsive card grid
 * with URL-based pagination (?page=N).
 */

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/services";
import { getPublishedPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";

const PER_PAGE = 9;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const siteUrl = getSiteUrl();

  const title = t("metadata.title");
  const description = t("metadata.description");

  const alternates: Record<string, string> = {};
  for (const loc of routing.locales) {
    alternates[loc] = `${siteUrl}/${loc}/blog`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/blog`,
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/blog`,
      siteName: "Lunatech",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BlogListPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  setRequestLocale(locale);

  const safeLocale = routing.locales.includes(
    locale as (typeof routing.locales)[number],
  )
    ? (locale as "az" | "en" | "ru")
    : "az";

  const [t, allPosts] = await Promise.all([
    getTranslations({ locale, namespace: "blog" }),
    getPublishedPosts(),
  ]);

  const totalPosts = allPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / PER_PAGE));
  const currentPage = Math.min(
    Math.max(1, parseInt(pageParam ?? "1", 10) || 1),
    totalPages,
  );
  const posts = allPosts.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const pageUrl = (p: number) =>
    p === 1 ? `/${locale}/blog` : `/${locale}/blog?page=${p}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-14 text-center">
        <h1 className="text-gradient-hero text-4xl font-bold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg" style={{ color: "rgba(244,244,245,0.55)" }}>
          {t("subtitle")}
        </p>
      </header>

      {/* Grid or empty state */}
      {totalPosts === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-20 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(124,58,237,0.10)",
              border: "1px solid rgba(124,58,237,0.18)",
            }}
          >
            <svg
              width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="rgba(167,139,250,0.85)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{t("emptyTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(244,244,245,0.45)" }}>
              {t("emptySubtitle")}
            </p>
          </div>
          <Link
            href={`/${locale}`}
            className="rounded-full border px-5 py-2 text-sm font-medium transition-colors duration-200 hover:border-white/20 hover:text-white"
            style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(244,244,245,0.55)" }}
          >
            {t("backToHome")}
          </Link>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" role="list">
            {posts.map((post) => (
              <li key={post.id}>
                <BlogCard post={post} locale={safeLocale} readMoreLabel={t("readMore")} />
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label={t("page")}
              className="mt-14 flex items-center justify-center gap-2"
            >
              {/* Prev */}
              {currentPage > 1 ? (
                <Link
                  href={pageUrl(currentPage - 1)}
                  className="rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 hover:border-white/20 hover:text-white"
                  style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(244,244,245,0.55)" }}
                >
                  {t("prevPage")}
                </Link>
              ) : (
                <span
                  className="rounded-full border px-4 py-2 text-sm font-medium cursor-not-allowed select-none"
                  style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(244,244,245,0.2)" }}
                  aria-disabled="true"
                >
                  {t("prevPage")}
                </span>
              )}

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const isCurrent = p === currentPage;
                  // Show first, last, current and neighbours; collapse rest with ellipsis
                  const show =
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1;

                  if (!show) {
                    // Render ellipsis only once between gaps
                    const prevShow =
                      p - 1 === 1 ||
                      p - 1 === totalPages ||
                      Math.abs(p - 1 - currentPage) <= 1;
                    if (!prevShow) return null;
                    return (
                      <span
                        key={`ellipsis-${p}`}
                        className="px-1 text-sm select-none"
                        style={{ color: "rgba(244,244,245,0.25)" }}
                      >
                        …
                      </span>
                    );
                  }

                  return isCurrent ? (
                    <span
                      key={p}
                      aria-current="page"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
                      style={{ background: "rgba(124,58,237,0.25)", color: "rgba(196,181,253,1)", border: "1px solid rgba(124,58,237,0.4)" }}
                    >
                      {p}
                    </span>
                  ) : (
                    <Link
                      key={p}
                      href={pageUrl(p)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors duration-200 hover:bg-white/[0.06]"
                      style={{ color: "rgba(244,244,245,0.55)" }}
                      aria-label={`${t("page")} ${p}`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>

              {/* Next */}
              {currentPage < totalPages ? (
                <Link
                  href={pageUrl(currentPage + 1)}
                  className="rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 hover:border-white/20 hover:text-white"
                  style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(244,244,245,0.55)" }}
                >
                  {t("nextPage")}
                </Link>
              ) : (
                <span
                  className="rounded-full border px-4 py-2 text-sm font-medium cursor-not-allowed select-none"
                  style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(244,244,245,0.2)" }}
                  aria-disabled="true"
                >
                  {t("nextPage")}
                </span>
              )}
            </nav>
          )}
        </>
      )}
    </main>
  );
}
