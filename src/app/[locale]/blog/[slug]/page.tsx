/**
 * Public blog post detail page — /[locale]/blog/[slug]
 *
 * Server component. Renders post content in markdown via BlogContent.
 * Includes JSON-LD Article schema and full Open Graph / hreflang metadata.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/services";
import { getPublishedPosts, getPostBySlug } from "@/lib/blog";
import { BlogContent } from "@/components/blog/BlogContent";
import { blobImageUrl } from "@/lib/admin/imageUrl";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// ---------------------------------------------------------------------------
// Static params — published posts only
// ---------------------------------------------------------------------------

export async function generateStaticParams(): Promise<
  { locale: string; slug: string }[]
> {
  const posts = await getPublishedPosts();
  const params: { locale: string; slug: string }[] = [];
  for (const loc of routing.locales) {
    for (const post of posts) {
      params.push({ locale: loc, slug: post.slug });
    }
  }
  return params;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const safeLocale = routing.locales.includes(
    locale as (typeof routing.locales)[number],
  )
    ? (locale as "az" | "en" | "ru")
    : "az";

  const content = post[safeLocale];
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/${locale}/blog/${slug}`;

  const alternates: Record<string, string> = {};
  for (const loc of routing.locales) {
    alternates[loc] = `${siteUrl}/${loc}/blog/${slug}`;
  }

  return {
    title: `${content.title} | Lunatech`,
    description: content.excerpt,
    alternates: {
      canonical,
      languages: alternates,
    },
    openGraph: {
      title: content.title,
      description: content.excerpt,
      url: canonical,
      siteName: "Lunatech",
      locale,
      type: "article",
      ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}),
      ...(post.publishedAt
        ? { publishedTime: post.publishedAt }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.excerpt,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
  };
}

// ---------------------------------------------------------------------------
// Date formatter
// ---------------------------------------------------------------------------

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(
      locale === "az" ? "az-AZ" : locale === "ru" ? "ru-RU" : "en-GB",
      { year: "numeric", month: "long", day: "numeric" },
    );
  } catch {
    return iso.slice(0, 10);
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const safeLocale = routing.locales.includes(
    locale as (typeof routing.locales)[number],
  )
    ? (locale as "az" | "en" | "ru")
    : "az";

  const [post, t] = await Promise.all([
    getPostBySlug(slug),
    getTranslations({ locale, namespace: "blog" }),
  ]);

  if (!post) notFound();

  const content = post[safeLocale];
  const siteUrl = getSiteUrl();

  // JSON-LD Article schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.title,
    description: content.excerpt,
    ...(post.coverImage ? { image: post.coverImage } : {}),
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: "Lunatech",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Lunatech",
      url: siteUrl,
    },
    url: `${siteUrl}/${locale}/blog/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Back link */}
        <nav aria-label="Breadcrumb" className="mb-10">
          <Link
            href={`/${locale}/blog`}
            className="text-sm transition-colors duration-200"
            style={{ color: "rgba(244,244,245,0.45)" }}
          >
            {t("backToList")}
          </Link>
        </nav>

        {/* Cover image */}
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blobImageUrl(post.coverImage)}
            alt={content.title}
            className="mb-10 w-full rounded-2xl object-cover"
            style={{
              maxHeight: "420px",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          />
        )}

        {/* Header */}
        <header className="mb-10">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(244,244,245,0.5)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
            {content.title}
          </h1>

          {post.publishedAt && (
            <p
              className="mt-4 text-sm"
              style={{ color: "rgba(244,244,245,0.4)" }}
            >
              <span className="mr-1">{t("publishedOn")}:</span>
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt, locale)}
              </time>
            </p>
          )}
        </header>

        {/* Post body */}
        <BlogContent content={content.content} />
      </main>
    </>
  );
}
