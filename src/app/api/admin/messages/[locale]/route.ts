/**
 * Admin Route Handlers — i18n message catalogue CRUD.
 *
 * GET  /api/admin/messages/[locale]
 *   Returns the full message catalogue as flat dot-notation key/value pairs.
 *   Response: { ok: true; data: Record<string, string> }
 *
 * PUT  /api/admin/messages/[locale]
 *   Accepts { flat: Record<string, string> }, unflattens and persists it.
 *   After a successful write, revalidatePath('/') is called for every locale
 *   so rendered pages pick up the change on their next request.
 *   Response: { ok: true }
 *
 * Both handlers require a valid admin session cookie; unauthenticated requests
 * receive a 401 with no session detail in the body.
 *
 * Caching: Route Handlers are dynamic by default in Next.js 16 (no static
 * caching). We set `dynamic = 'force-dynamic'` explicitly to make the intent
 * clear and to guarantee no accidental prerendering.
 *
 * `params` in Next.js 16 is a Promise — always `await params` before use.
 */

import { revalidatePath } from "next/cache";
import {
  getMessages,
  setMessages,
} from "@/lib/admin/contentStore";
import { getAdminSessionOrNull } from "@/lib/admin/session";
import {
  flattenMessages,
  unflattenMessages,
} from "@/lib/admin/messageFlatten";
import type { MessageTree } from "@/lib/admin/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Locale validation
// ---------------------------------------------------------------------------

const VALID_LOCALES = ["az", "en", "ru"] as const;
type SupportedLocale = (typeof VALID_LOCALES)[number];

function isSupportedLocale(value: string): value is SupportedLocale {
  return (VALID_LOCALES as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// GET /api/admin/messages/[locale]
// ---------------------------------------------------------------------------

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> },
): Promise<Response> {
  const session = await getAdminSessionOrNull();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return Response.json(
      { ok: false, error: "Invalid locale. Must be one of: az, en, ru." },
      { status: 400 },
    );
  }

  let tree: MessageTree;
  try {
    tree = await getMessages(locale);
  } catch {
    return Response.json(
      { ok: false, error: "Failed to read messages." },
      { status: 500 },
    );
  }

  const flat = flattenMessages(tree);

  return Response.json({ ok: true, data: flat });
}

// ---------------------------------------------------------------------------
// PUT /api/admin/messages/[locale]
// ---------------------------------------------------------------------------

type PutBody = {
  flat: Record<string, string>;
};

function isPutBody(value: unknown): value is PutBody {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  if (obj.flat === null || typeof obj.flat !== "object" || Array.isArray(obj.flat)) {
    return false;
  }
  // Verify every entry is string → string.
  for (const [k, v] of Object.entries(obj.flat as Record<string, unknown>)) {
    if (typeof k !== "string" || typeof v !== "string") return false;
  }
  return true;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ locale: string }> },
): Promise<Response> {
  const session = await getAdminSessionOrNull();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return Response.json(
      { ok: false, error: "Invalid locale. Must be one of: az, en, ru." },
      { status: 400 },
    );
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

  if (!isPutBody(body)) {
    return Response.json(
      {
        ok: false,
        error:
          'Request body must be { flat: Record<string, string> }.',
      },
      { status: 422 },
    );
  }

  const tree = unflattenMessages(body.flat) as MessageTree;

  try {
    await setMessages(locale, tree);
  } catch {
    return Response.json(
      { ok: false, error: "Failed to persist messages." },
      { status: 500 },
    );
  }

  // Invalidate rendered pages for all locales so the new copy is served on
  // the next request. revalidatePath with 'layout' scope covers every nested
  // segment under that prefix.
  for (const loc of VALID_LOCALES) {
    revalidatePath(`/${loc}`, "layout");
  }
  // Also cover the root in case locale prefix is omitted (defaultLocale).
  revalidatePath("/", "layout");

  return Response.json({ ok: true });
}
