/**
 * Admin — Messages editor for a specific locale.
 *
 * Server component. Validates the locale param, loads the message catalogue
 * directly via contentStore (bypasses the HTTP route — auth is already
 * enforced by the protected layout), and passes it to the `MessagesEditor`
 * client component.
 *
 * Next.js 16: `params` and `searchParams` are Promises — must be awaited.
 */

import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MessagesEditor } from "@/components/admin/MessagesEditor";
import { getMessages } from "@/lib/admin/contentStore";
import { flattenMessages } from "@/lib/admin/messageFlatten";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SupportedLocale = "az" | "en" | "ru";

const SUPPORTED_LOCALES: SupportedLocale[] = ["az", "en", "ru"];

function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Page props — Next.js 16 (params is Promise)
// ---------------------------------------------------------------------------

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ section?: string }>;
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function MessagesLocalePage({ params, searchParams }: Props) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const { section } = await searchParams;

  const tree = await getMessages(locale);
  const initialFlat = flattenMessages(tree as Record<string, unknown>);

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-1">
          Məzmun redaktoru
        </h1>
        <p className="text-sm" style={{ color: "rgba(244,244,245,0.5)" }}>
          Locale:{" "}
          <span
            className="font-mono uppercase"
            style={{ color: "rgba(244,244,245,0.75)" }}
          >
            {locale}
          </span>
        </p>
      </div>

      {/* Suspense boundary keeps the shell rendered while the client bundle
          hydrates. MessagesEditor is a client-only component. */}
      <Suspense
        fallback={
          <div
            className="text-sm"
            style={{ color: "rgba(244,244,245,0.4)" }}
          >
            Yüklənir...
          </div>
        }
      >
        <MessagesEditor
          locale={locale}
          initialFlat={initialFlat}
          initialSection={section}
        />
      </Suspense>
    </div>
  );
}
