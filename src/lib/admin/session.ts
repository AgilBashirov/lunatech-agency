/**
 * Server-side session helpers for admin route handlers and server components.
 *
 * Reads the signed session cookie and delegates verification to auth.ts.
 * This file must only run on the server — it imports `next/headers`.
 */

import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./auth";
import type { AdminSession } from "./types";

/**
 * Read and verify the admin session from the incoming request cookie.
 *
 * Returns the decoded `AdminSession` when the cookie is present, the
 * signature is valid, and the session has not expired.
 * Returns `null` in all other cases (no cookie, bad signature, expired).
 *
 * Safe to call from Server Components and Route Handlers.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  // Next.js 16: cookies() is async — must be awaited.
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return verifySession(raw);
}

/**
 * Convenience wrapper that returns the session or `null`.
 *
 * Intended for Route Handlers that need to guard their logic:
 *
 * ```ts
 * const session = await getAdminSessionOrNull();
 * if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 * ```
 *
 * The caller is responsible for returning a 401 response when the result is
 * `null`. This keeps the function free of `NextResponse` imports so it can
 * also be used in Server Components without pulling in response-only APIs.
 */
export async function getAdminSessionOrNull(): Promise<AdminSession | null> {
  return getAdminSession();
}
