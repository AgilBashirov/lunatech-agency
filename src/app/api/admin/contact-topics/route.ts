/**
 * Admin Route Handlers — contact-topics collection.
 *
 * GET  /api/admin/contact-topics
 *   Returns the full topic list sorted by `order`.
 *   Response: { ok: true; data: ContactTopic[] }
 *
 * POST /api/admin/contact-topics
 *   Creates a new topic. Assigns `order` = max existing + 1 if not provided.
 *   Body: Omit<ContactTopic, "order"> & { order?: number }
 *   Response: { ok: true; data: ContactTopic }
 *
 * Both handlers require a valid admin session cookie.
 *
 * `params` convention note: collection routes have no dynamic segment so
 * `params` is not used here.
 */

import { revalidatePath } from "next/cache";
import { getContactTopics, setContactTopics } from "@/lib/admin/contentStore";
import { getAdminSessionOrNull } from "@/lib/admin/session";
import type { ContactTopic } from "@/lib/admin/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type TopicInput = {
  id: string;
  telegramLabel: string;
  az: string;
  en: string;
  ru: string;
  order?: number;
};

function isTopicInput(value: unknown): value is TopicInput {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.telegramLabel === "string" &&
    typeof v.az === "string" &&
    typeof v.en === "string" &&
    typeof v.ru === "string" &&
    (v.order === undefined || typeof v.order === "number")
  );
}

function validateSlug(id: string): string | null {
  if (!id.trim()) return "id boş ola bilməz.";
  if (!SLUG_RE.test(id))
    return "id yalnız kiçik hərf, rəqəm və defis (-) ehtiva etməlidir.";
  return null;
}

// ---------------------------------------------------------------------------
// GET /api/admin/contact-topics
// ---------------------------------------------------------------------------

export async function GET(): Promise<Response> {
  const session = await getAdminSessionOrNull();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const topics = await getContactTopics();
  return Response.json({ ok: true, data: topics });
}

// ---------------------------------------------------------------------------
// POST /api/admin/contact-topics
// ---------------------------------------------------------------------------

export async function POST(req: Request): Promise<Response> {
  const session = await getAdminSessionOrNull();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { ok: false, error: "Request body is not valid JSON." },
      { status: 400 },
    );
  }

  if (!isTopicInput(body)) {
    return Response.json(
      {
        ok: false,
        error:
          "Body must contain: id, telegramLabel, az, en, ru (all strings). order (number) is optional.",
      },
      { status: 422 },
    );
  }

  const slugError = validateSlug(body.id);
  if (slugError) {
    return Response.json({ ok: false, error: slugError }, { status: 422 });
  }

  const topics = await getContactTopics();

  if (topics.some((t) => t.id === body.id)) {
    return Response.json(
      { ok: false, error: `"${body.id}" id-si artıq mövcuddur.` },
      { status: 409 },
    );
  }

  const maxOrder = topics.reduce((acc, t) => Math.max(acc, t.order), -1);
  const newTopic: ContactTopic = {
    id: body.id,
    telegramLabel: body.telegramLabel,
    az: body.az,
    en: body.en,
    ru: body.ru,
    order: typeof body.order === "number" ? body.order : maxOrder + 1,
  };

  await setContactTopics([...topics, newTopic]);

  // Invalidate rendered pages so the updated topic list is served immediately.
  for (const loc of ["az", "en", "ru"] as const) {
    revalidatePath(`/${loc}`, "layout");
  }
  revalidatePath("/", "layout");

  return Response.json({ ok: true, data: newTopic }, { status: 201 });
}
