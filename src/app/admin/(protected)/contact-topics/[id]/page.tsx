/**
 * Admin — Əlaqə mövzusunu redaktə et / sil (edit/delete contact topic).
 *
 * Server component. Loads the topic by id from Blob storage and renders
 * an edit form plus a delete confirmation section.
 * updateTopic uses the FormActionResult pattern (not redirect) to avoid the
 * "Router action dispatched before initialization" bug in Next.js.
 *
 * Next.js 16: `params` is a Promise — always `await params` before use.
 */

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getContactTopics, setContactTopics } from "@/lib/admin/contentStore";
import { getAdminSession } from "@/lib/admin/session";
import type { ContactTopic } from "@/lib/admin/types";
import type { FormActionResult } from "@/lib/admin/types";
import { ContactTopicForm } from "@/components/admin/ContactTopicForm";

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

async function updateTopic(
  topicId: string,
  _prevState: FormActionResult | null,
  formData: FormData,
): Promise<FormActionResult> {
  "use server";

  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const telegramLabel =
    (formData.get("telegramLabel") as string | null)?.trim() ?? "";
  const az = (formData.get("az") as string | null)?.trim() ?? "";
  const en = (formData.get("en") as string | null)?.trim() ?? "";
  const ru = (formData.get("ru") as string | null)?.trim() ?? "";
  const orderRaw = (formData.get("order") as string | null)?.trim() ?? "";

  if (!telegramLabel || !az || !en || !ru) {
    return {
      ok: false,
      error: "invalid",
      detail: "Zəhmət olmasa bütün tələb olunan sahələri doldurun.",
    };
  }

  const topics = await getContactTopics();
  const existing = topics.find((t) => t.id === topicId);
  if (!existing) redirect("/admin/contact-topics");

  const order =
    orderRaw !== "" && !isNaN(Number(orderRaw))
      ? Number(orderRaw)
      : existing.order;

  const updated: ContactTopic = {
    id: topicId,
    telegramLabel,
    az,
    en,
    ru,
    order,
  };

  try {
    await setContactTopics(topics.map((t) => (t.id === topicId ? updated : t)));
  } catch (err) {
    const detail =
      err instanceof Error ? err.message.slice(0, 200) : undefined;
    return { ok: false, error: "server", detail };
  }

  for (const loc of ["az", "en", "ru"] as const) {
    revalidatePath(`/${loc}`, "layout");
  }
  revalidatePath("/", "layout");

  return { ok: true };
}

async function deleteTopic(topicId: string): Promise<void> {
  "use server";

  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const topics = await getContactTopics();
  const next = topics.filter((t) => t.id !== topicId);
  await setContactTopics(next);

  for (const loc of ["az", "en", "ru"] as const) {
    revalidatePath(`/${loc}`, "layout");
  }
  revalidatePath("/", "layout");

  redirect("/admin/contact-topics");
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ delete?: string }>;
};

export default async function EditContactTopicPage({
  params,
  searchParams,
}: Props) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const { delete: deleteFlag } = await searchParams;

  const topics = await getContactTopics();
  const topic = topics.find((t) => t.id === id);

  if (!topic) notFound();

  const updateAction = updateTopic.bind(null, id);
  const deleteAction = deleteTopic.bind(null, id);

  return (
    <div className="p-6 md:p-8 max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-1">
          Mövzunu redaktə et
        </h1>
        <p className="text-xs font-mono" style={{ color: "rgba(244,244,245,0.35)" }}>
          id: {topic.id}
        </p>
      </div>

      {/* Edit form — errors shown inline by ContactTopicForm via useActionState */}
      <ContactTopicForm
        defaults={topic}
        action={updateAction}
        submitLabel="Yadda saxla"
      />

      {/* Separator */}
      <hr
        className="my-8"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      />

      {/* Delete zone */}
      <div
        className="rounded-xl border p-5"
        style={{
          borderColor: "rgba(239,68,68,0.2)",
          background: "rgba(239,68,68,0.04)",
        }}
      >
        <h2 className="mb-1 text-sm font-medium text-red-400">Mövzunu sil</h2>
        <p className="mb-4 text-xs" style={{ color: "rgba(244,244,245,0.4)" }}>
          Bu əməliyyat geri qaytarıla bilməz. Mövzu formdan dərhal silinəcək.
        </p>

        {deleteFlag === "1" ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-red-300">
              &ldquo;{topic.az}&rdquo; silinsin?
            </p>
            <form action={deleteAction} className="flex gap-2">
              <button
                type="submit"
                className="rounded-md px-4 py-1.5 text-xs font-medium text-white transition-colors"
                style={{ background: "rgba(239,68,68,0.6)" }}
              >
                Bəli, sil
              </button>
              <Link
                href={`/admin/contact-topics/${id}`}
                className="rounded-md border px-4 py-1.5 text-xs font-medium transition-colors"
                style={{
                  borderColor: "rgba(255,255,255,0.10)",
                  color: "rgba(244,244,245,0.55)",
                }}
              >
                Ləğv et
              </Link>
            </form>
          </div>
        ) : (
          <Link
            href={`/admin/contact-topics/${id}?delete=1`}
            className="inline-flex items-center rounded-md border px-4 py-1.5 text-xs font-medium transition-colors"
            style={{
              borderColor: "rgba(239,68,68,0.3)",
              color: "rgba(239,68,68,0.7)",
            }}
          >
            Sil
          </Link>
        )}
      </div>
    </div>
  );
}
