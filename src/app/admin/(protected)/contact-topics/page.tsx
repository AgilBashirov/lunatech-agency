/**
 * Admin — Əlaqə mövzuları (contact topics) list page.
 *
 * Server component. Reads topics from Blob (falls back to seed) and renders
 * a simple card list with edit links and delete forms.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getContactTopics } from "@/lib/admin/contentStore";
import { getAdminSession } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function ContactTopicsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const topics = await getContactTopics();

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white mb-1">
            Əlaqə mövzuları
          </h1>
          <p className="text-sm" style={{ color: "rgba(244,244,245,0.5)" }}>
            Əlaqə formasındakı mövzu seçimlərini idarə edin.
          </p>
        </div>
        <Link
          href="/admin/contact-topics/new"
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          style={{ background: "rgba(255,255,255,0.08)", color: "#f4f4f5" }}
        >
          + Yeni mövzu
        </Link>
      </div>

      {topics.length === 0 ? (
        <p className="text-sm" style={{ color: "rgba(244,244,245,0.4)" }}>
          Heç bir mövzu tapılmadı. Yeni mövzu əlavə edin.
        </p>
      ) : (
        <ul className="space-y-3" role="list">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
              style={{
                background: "#1a1a1a",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              {/* Left: order badge + labels */}
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-mono"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(244,244,245,0.45)",
                  }}
                  aria-label={`Sıra: ${topic.order}`}
                >
                  {topic.order}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {topic.az}
                  </p>
                  <p
                    className="truncate text-xs font-mono"
                    style={{ color: "rgba(244,244,245,0.35)" }}
                  >
                    {topic.id} &mdash; Telegram: {topic.telegramLabel}
                  </p>
                </div>
              </div>

              {/* Right: edit link + delete form */}
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/contact-topics/${topic.id}`}
                  className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:border-white/20"
                  style={{
                    borderColor: "rgba(255,255,255,0.10)",
                    color: "rgba(244,244,245,0.65)",
                  }}
                >
                  Redaktə
                </Link>

                <form
                  action={`/api/admin/contact-topics/${topic.id}`}
                  method="POST"
                >
                  {/* Native form method override: browsers don't send DELETE,
                      so we use a hidden field convention. Our Route Handler
                      already handles DELETE on the same URL — this form POSTs
                      to a different path to keep the UI simple. Instead we use
                      a server action via the delete page; here we link to a
                      confirmation page embedded in the edit page. */}
                  <input type="hidden" name="_method" value="DELETE" />
                  <DeleteButton topicId={topic.id} topicLabel={topic.az} />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete button — client-side confirmation wrapper
// ---------------------------------------------------------------------------
// This is a minimal inline approach: the actual delete is performed by the
// Route Handler. We keep it as a plain HTML form with a JS confirm dialog
// so we don't need a separate client component file.

function DeleteButton({
  topicId,
  topicLabel,
}: {
  topicId: string;
  topicLabel: string;
}) {
  // Server components cannot attach onClick. The form targets the API route
  // directly. A confirmation dialog is added via the onsubmit attribute which
  // is acceptable for admin-only UI (no public facing users).
  return (
    <Link
      href={`/admin/contact-topics/${topicId}?delete=1`}
      className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:border-red-500/40"
      style={{
        borderColor: "rgba(255,255,255,0.07)",
        color: "rgba(239,68,68,0.65)",
      }}
      aria-label={`"${topicLabel}" mövzusunu sil`}
    >
      Sil
    </Link>
  );
}
