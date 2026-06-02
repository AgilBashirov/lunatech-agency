/**
 * One-time seed script — uploads existing static content to Vercel Blob.
 *
 * Run with:
 *   node --env-file=.env.local -r tsx/cjs scripts/seed-blob.ts
 *
 * The --env-file flag (Node 20.6+) injects .env.local variables before the
 * script runs, so BLOB_READ_WRITE_TOKEN is available without dotenv.
 *
 * Behaviour:
 *   - messages/{az,en,ru}.json  → content/messages/{locale}.json
 *   - empty []                  → content/blog.json
 *   - empty []                  → content/portfolio.json
 *
 * Each file is checked via blobExists() before upload — existing blobs are
 * skipped to prevent accidental overwrites of live data.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { blobExists, writeJson } from "../src/lib/admin/blob";
import type { MessageTree } from "../src/lib/admin/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg: string): void {
  console.log(`[seed-blob] ${msg}`);
}

/**
 * Load a JSON file from the filesystem relative to the project root.
 */
function loadJsonFile<T>(relativePath: string): T {
  const absolute = resolve(process.cwd(), relativePath);
  const raw = readFileSync(absolute, "utf-8");
  return JSON.parse(raw) as T;
}

// ---------------------------------------------------------------------------
// Seed tasks
// ---------------------------------------------------------------------------

type SeedTask =
  | { blobPath: string; data: unknown }
  | { blobPath: string; loadFrom: string };

const LOCALES = ["az", "en", "ru"] as const;

const tasks: SeedTask[] = [
  // Blog — start empty
  { blobPath: "content/blog.json", data: [] },

  // Portfolio — start empty
  { blobPath: "content/portfolio.json", data: [] },

  // Messages — read from bundled static files
  ...LOCALES.map((locale) => ({
    blobPath: `content/messages/${locale}.json`,
    loadFrom: `messages/${locale}.json`,
  })),
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    log(
      "ERROR: BLOB_READ_WRITE_TOKEN is not set. " +
        "Run with --env-file=.env.local or export the variable.",
    );
    process.exit(1);
  }

  log("Starting seed...");

  for (const task of tasks) {
    const { blobPath } = task;

    const exists = await blobExists(blobPath);
    if (exists) {
      log(`SKIP  ${blobPath} — already exists in Blob`);
      continue;
    }

    const data: unknown =
      "loadFrom" in task
        ? loadJsonFile<MessageTree>(task.loadFrom)
        : task.data;

    await writeJson(blobPath, data);
    log(`OK    ${blobPath}`);
  }

  log("Seed complete.");
}

main().catch((err: unknown) => {
  console.error("[seed-blob] Fatal error:", err);
  process.exit(1);
});
