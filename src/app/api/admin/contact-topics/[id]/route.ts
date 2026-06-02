/**
 * Admin Route Handlers — single contact-topic operations.
 *
 * PUT    /api/admin/contact-topics/[id]
 *   Replace a topic's mutable fields (telegramLabel, az, en, ru, order).
 *   The topic `id` cannot be changed via this endpoint.
 *   Response: { ok: true; data: ContactTopic }
 *
 * DELETE /api/admin/contact-topics/[id]
 *   Remove the topic from the list. The remaining topics are re-persisted as-is
 *   (order values are left intact — callers may normalise order via PUT).
 *   Response: { ok: true }
 *
 * Both handlers require a valid admin session cookie.
 *
 * Next.js 16: `params` is a Promise — always `await params` before use.
 */

import { revalidatePath } from "next/cache";
import { getContactTopics, setContactTopics } from "@/lib/admin/contentStore";
import { getAdminSessionOrNull } from "@/lib/admin/session";
import type { ContactTopic } from "@/lib/admin/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Validation helper
// ---------------------------------------------------------------------------

type TopicUpdate = {
  telegramLabel: string;
  az: string;
  en: string;
  ru: string;
  order: number;
};

function isTopicUpdate(value: unknown): value is TopicUpdate {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.telegramLabel === "string" &&
    typeof v.az === "string" &&
    typeof v.en === "string" &&
    typeof v.ru === "string" &&
    typeof v.order === "number"
  );
}

// ---------------------------------------------------------------------------
// Revalidate all locale pages after a topic mutation.
// ---------------------------------------------------------------------------

async function revalidateTopicPages(): Promise<void> {
  for (const loc of ["az", "en", "ru"] as const) {
    revalidatePath(`/${loc}`, "layout");
  }
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// PUT /api/admin/contact-topics/[id]
// ---------------------------------------------------------------------------

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await getAdminSessionOrNull();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { ok: false, error: "Request body is not valid JSON." },
      { status: 400 },
    );
  }

  if (!isTopicUpdate(body)) {
    return Response.json(
      {
        ok: false,
        error:
          "Body must contain: telegramLabel, az, en, ru (strings) and order (number).",
      },
      { status: 422 },
    );
  }

  const topics = await getContactTopics();
  const index = topics.findIndex((t) => t.id === id);

  if (index === -1) {
    return Response.json(
      { ok: false, error: `Topic "${id}" tapılmadı.` },
      { status: 404 },
    );
  }

  const updated: ContactTopic = {
    id,
    telegramLabel: body.telegramLabel,
    az: body.az,
    en: body.en,
    ru: body.ru,
    order: body.order,
  };

  const next = topics.map((t) => (t.id === id ? updated : t));
  await setContactTopics(next);
  await revalidateTopicPages();

  return Response.json({ ok: true, data: updated });
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/contact-topics/[id]
// ---------------------------------------------------------------------------

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await getAdminSessionOrNull();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const topics = await getContactTopics();
  const exists = topics.some((t) => t.id === id);

  if (!exists) {
    return Response.json(
      { ok: false, error: `Topic "${id}" tapılmadı.` },
      { status: 404 },
    );
  }

  const next = topics.filter((t) => t.id !== id);
  await setContactTopics(next);
  await revalidateTopicPages();

  return Response.json({ ok: true });
}
