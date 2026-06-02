/**
 * BlogCard — public blog post card.
 *
 * Server component (no interactivity). Displays cover image, title, excerpt,
 * publication date and up to 3 tags, linking to the full post.
 */

import Link from "next/link";
import type { BlogPost } from "@/lib/admin/types";
import { blobImageUrl } from "@/lib/admin/imageUrl";

type Props = {
  post: BlogPost;
  locale: "az" | "en" | "ru";
  readMoreLabel: string;
};

/** Format an ISO date string into a locale-aware date string. */
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

export function BlogCard({ post, locale, readMoreLabel }: Props) {
  const content = post[locale];
  const href = `/${locale}/blog/${post.slug}`;
  const visibleTags = post.tags.slice(0, 3);
  const hasImage = Boolean(post.coverImage);

  const wordCount = content.content
    ? content.content.trim().split(/\s+/).length
    : 0;
  const readMinutes = wordCount > 100 ? Math.max(1, Math.ceil(wordCount / 200)) : null;
  const readTimeLabel = readMinutes
    ? locale === "ru"
      ? `${readMinutes} мин`
      : locale === "az"
        ? `${readMinutes} dəq`
        : `${readMinutes} min`
    : null;

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border transition-[border-color,background-color] duration-300 hover:border-white/[0.13]"
      style={{
        background: "#111111",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      {/* Cover image / gradient placeholder */}
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block shrink-0">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blobImageUrl(post.coverImage)}
            alt={content.title}
            className="h-44 w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="h-44 w-full"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
            }}
            aria-hidden="true"
          />
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Tags */}
        {visibleTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label="Teqlər">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(244,244,245,0.55)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="text-base font-semibold leading-snug text-white">
          <Link
            href={href}
            className="transition-colors duration-200 group-hover:text-white/80"
          >
            {content.title}
          </Link>
        </h2>

        {/* Excerpt — 2-line clamp */}
        {content.excerpt && (
          <p
            className="line-clamp-2 text-sm leading-relaxed"
            style={{ color: "rgba(244,244,245,0.5)" }}
          >
            {content.excerpt}
          </p>
        )}

        {/* Footer: date + read time + read link */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2">
            {post.publishedAt && (
              <time
                dateTime={post.publishedAt}
                className="text-xs"
                style={{ color: "rgba(244,244,245,0.35)" }}
              >
                {formatDate(post.publishedAt, locale)}
              </time>
            )}
            {readTimeLabel && post.publishedAt && (
              <span className="text-xs" style={{ color: "rgba(244,244,245,0.2)" }}>·</span>
            )}
            {readTimeLabel && (
              <span className="text-xs" style={{ color: "rgba(244,244,245,0.35)" }}>
                {readTimeLabel}
              </span>
            )}
          </div>

          <Link
            href={href}
            className="shrink-0 text-xs font-medium transition-colors duration-200 group-hover:text-white"
            style={{ color: "rgba(244,244,245,0.55)" }}
            aria-label={`${content.title} — ${readMoreLabel}`}
          >
            {readMoreLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
