/**
 * Admin — Yeni əlaqə mövzusu (new contact topic) page.
 *
 * Server component with an inline Server Action that calls
 * getContactTopics / setContactTopics directly without going through the
 * HTTP API route (avoids a self-fetch in the same process).
 * The action returns a FormActionResult instead of calling redirect() to avoid
 * the "Router action dispatched before initialization" bug in Next.js.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getContactTopics, setContactTopics } from "@/lib/admin/contentStore";
import { getAdminSession } from "@/lib/admin/session";
import type { ContactTopic } from "@/lib/admin/types";
import type { FormActionResult } from "@/lib/admin/types";
import { ContactTopicForm } from "@/components/admin/ContactTopicForm";

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

async function createTopic(
  _prevState: FormActionResult | null,
  formData: FormData,
): Promise<FormActionResult> {
  "use server";

  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const id = (formData.get("id") as string | null)?.trim() ?? "";
  const telegramLabel =
    (formData.get("telegramLabel") as string | null)?.trim() ?? "";
  const az = (formData.get("az") as string | null)?.trim() ?? "";
  const en = (formData.get("en") as string | null)?.trim() ?? "";
  const ru = (formData.get("ru") as string | null)?.trim() ?? "";
  const orderRaw = (formData.get("order") as string | null)?.trim() ?? "";

  const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!id || !SLUG_RE.test(id) || !telegramLabel || !az || !en || !ru) {
    return {
      ok: false,
      error: "invalid",
      detail:
        "Zəhmət olmasa bütün sahələri düzgün doldurun. id yalnız kiçik hərf, rəqəm və defis (-) ehtiva etməlidir.",
    };
  }

  const topics = await getContactTopics();

  if (topics.some((t) => t.id === id)) {
    return {
      ok: false,
      error: "invalid",
      detail: `"${id}" id-si artıq mövcuddur. Başqa bir id seçin.`,
    };
  }

  const maxOrder = topics.reduce((acc, t) => Math.max(acc, t.order), -1);
  const order =
    orderRaw !== "" && !isNaN(Number(orderRaw))
      ? Number(orderRaw)
      : maxOrder + 1;

  const newTopic: ContactTopic = {
    id,
    telegramLabel,
    az,
    en,
    ru,
    order,
  };

  try {
    await setContactTopics([...topics, newTopic]);
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function NewContactTopicPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="p-6 md:p-8 max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-1">
          Yeni mövzu əlavə et
        </h1>
        <p className="text-sm" style={{ color: "rgba(244,244,245,0.5)" }}>
          Əlaqə formasında göstəriləcək yeni mövzu yaradın.
        </p>
      </div>

      <ContactTopicForm action={createTopic} submitLabel="Saxla" />
    </div>
  );
}
