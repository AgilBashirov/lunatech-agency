/**
 * Admin authentication helpers — Edge-compatible, Web Crypto only.
 *
 * Token format:
 *   base64url(JSON(AdminSession)) + "." + base64url(HMAC-SHA256)
 *
 * Key source: ADMIN_SESSION_SECRET env variable (64-char hex string).
 * Key is imported lazily on first use so that the module can be imported
 * at build time without ADMIN_SESSION_SECRET being present.
 */

import type { AdminSession } from "./types";

// ---------------------------------------------------------------------------
// Public constant
// ---------------------------------------------------------------------------

export const SESSION_COOKIE = "admin_session";

// ---------------------------------------------------------------------------
// Session duration
// ---------------------------------------------------------------------------

const SESSION_TTL_SECONDS = 86_400; // 24 hours

// ---------------------------------------------------------------------------
// Key bootstrapping (lazy — imported on first call, not at module load time)
// ---------------------------------------------------------------------------

let _cryptoKeyPromise: Promise<CryptoKey> | null = null;

/**
 * Return the HMAC-SHA256 CryptoKey, importing it once and caching the Promise.
 * Throws at call time (not at import time) if ADMIN_SESSION_SECRET is absent.
 * `globalThis.crypto.subtle` is available in both Node.js >=18 and Edge.
 */
function getCryptoKey(): Promise<CryptoKey> {
  if (_cryptoKeyPromise) return _cryptoKeyPromise;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "[admin/auth] ADMIN_SESSION_SECRET is not set. " +
        "Add a 64-char hex string to .env.local before starting the server.",
    );
  }
  _cryptoKeyPromise = globalThis.crypto.subtle.importKey(
    "raw",
    hexToBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, // non-extractable
    ["sign", "verify"],
  );
  return _cryptoKeyPromise;
}

// ---------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  if (hex.length % 2 !== 0) {
    throw new Error("[admin/auth] ADMIN_SESSION_SECRET must be an even-length hex string.");
  }
  const buf = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function fromBase64Url(str: string): Uint8Array {
  // Restore standard base64 padding
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLen);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Timing-safe comparison of two ArrayBuffers using a double-HMAC technique
 * that avoids Node.js `crypto.timingSafeEqual` to stay Edge-compatible.
 *
 * Both buffers are HMAC-signed with a random key; the resulting signatures
 * are compared with `===`. An attacker cannot exploit timing differences
 * because the random key is ephemeral and unknown.
 */
async function timingSafeEqual(a: ArrayBuffer, b: ArrayBuffer): Promise<boolean> {
  const key = await globalThis.crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const [sigA, sigB] = await Promise.all([
    globalThis.crypto.subtle.sign("HMAC", key, a),
    globalThis.crypto.subtle.sign("HMAC", key, b),
  ]);
  // Compare the two 32-byte signatures byte-by-byte without branching.
  const ua = new Uint8Array(sigA);
  const ub = new Uint8Array(sigB);
  let diff = 0;
  for (let i = 0; i < ua.length; i++) {
    diff |= ua[i] ^ ub[i];
  }
  return diff === 0;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a signed session token for `payload`.
 * Returns `base64url(JSON(payload)).base64url(HMAC-SHA256)`.
 */
export async function signSession(payload: AdminSession): Promise<string> {
  const key = await getCryptoKey();
  const encodedPayload = toBase64Url(
    new TextEncoder().encode(JSON.stringify(payload)).buffer as ArrayBuffer,
  );
  const signatureBuffer = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encodedPayload),
  );
  const encodedSignature = toBase64Url(signatureBuffer);
  return `${encodedPayload}.${encodedSignature}`;
}

/**
 * Verify and decode a session token.
 * Returns `null` if the token is malformed, the signature is invalid,
 * or the session has expired.
 */
export async function verifySession(token: string): Promise<AdminSession | null> {
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const encodedPayload = token.slice(0, dotIndex);
  const encodedSignature = token.slice(dotIndex + 1);

  if (!encodedPayload || !encodedSignature) return null;

  const key = await getCryptoKey();

  // Re-compute expected signature
  const expectedSigBuffer = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encodedPayload),
  );

  // Decode provided signature
  let providedSigBytes: Uint8Array;
  try {
    providedSigBytes = fromBase64Url(encodedSignature);
  } catch {
    return null;
  }

  // Timing-safe comparison
  const isValid = await timingSafeEqual(
    expectedSigBuffer,
    providedSigBytes.buffer as ArrayBuffer,
  );
  if (!isValid) return null;

  // Decode payload
  let payload: AdminSession;
  try {
    const jsonBytes = fromBase64Url(encodedPayload);
    const jsonString = new TextDecoder().decode(jsonBytes);
    payload = JSON.parse(jsonString) as AdminSession;
  } catch {
    return null;
  }

  // Validate shape
  if (
    typeof payload.username !== "string" ||
    typeof payload.exp !== "number"
  ) {
    return null;
  }

  // Check expiry
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp < nowSeconds) return null;

  return payload;
}

/**
 * Create a fresh `AdminSession` payload with a 24-hour expiry.
 * Callers pass the result to `signSession`.
 */
export function buildSessionPayload(username: string): AdminSession {
  return {
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
}

/**
 * Verify submitted credentials against env vars in constant time.
 * Both username and password checks always run to prevent short-circuit timing leaks.
 */
export async function verifyCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const expectedUsername = process.env.ADMIN_USERNAME ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";

  const enc = new TextEncoder();

  const [usernameMatch, passwordMatch] = await Promise.all([
    timingSafeEqual(
      enc.encode(username).buffer as ArrayBuffer,
      enc.encode(expectedUsername).buffer as ArrayBuffer,
    ),
    timingSafeEqual(
      enc.encode(password).buffer as ArrayBuffer,
      enc.encode(expectedPassword).buffer as ArrayBuffer,
    ),
  ]);

  return usernameMatch && passwordMatch;
}
