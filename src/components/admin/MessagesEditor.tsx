"use client";

/**
 * MessagesEditor — Client component.
 *
 * Renders the full i18n message catalogue as grouped, collapsible sections
 * with inline text inputs / textareas. Supports:
 *   - Keyword search filter across all keys and values
 *   - URL-driven auto-open via ?section=<namespace>
 *   - PUT /api/admin/messages/[locale] to persist changes
 *   - Inline save-state feedback (no third-party toast library)
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { ChevronRight, Search, Save } from "lucide-react";
import { cn } from "@/lib/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = {
  locale: string;
  initialFlat: Record<string, string>;
  /** Pre-open section slug, derived from server-side searchParams. */
  initialSection?: string;
};

type SaveState = "idle" | "saving" | "success" | "error";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Group flat dot-notation keys by their first segment. */
function groupByNamespace(
  flat: Record<string, string>,
): Map<string, Record<string, string>> {
  const groups = new Map<string, Record<string, string>>();

  for (const [key, value] of Object.entries(flat)) {
    const dotIdx = key.indexOf(".");
    const ns = dotIdx === -1 ? key : key.slice(0, dotIdx);

    if (!groups.has(ns)) {
      groups.set(ns, {});
    }
    groups.get(ns)![key] = value;
  }

  return groups;
}

/** Return true when a key/value pair matches the search query. */
function matchesSearch(key: string, value: string, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return key.toLowerCase().includes(q) || value.toLowerCase().includes(q);
}

// ---------------------------------------------------------------------------
// SectionPanel sub-component
// ---------------------------------------------------------------------------

type SectionPanelProps = {
  namespace: string;
  entries: Record<string, string>;
  isOpen: boolean;
  searchQuery: string;
  onToggle: (ns: string) => void;
  onChange: (key: string, value: string) => void;
  sectionRef?: MutableRefObject<HTMLDivElement | null>;
};

function SectionPanel({
  namespace,
  entries,
  isOpen,
  searchQuery,
  onToggle,
  onChange,
  sectionRef,
}: SectionPanelProps) {
  const filteredEntries = Object.entries(entries).filter(([key, val]) =>
    matchesSearch(key, val, searchQuery),
  );

  // When searching, always render matched entries even if section is "closed".
  const showEntries = isOpen || searchQuery.length > 0;
  const visibleEntries = showEntries ? filteredEntries : [];

  const keyCount = filteredEntries.length;
  const totalCount = Object.keys(entries).length;

  // Hide the section entirely when it has no matches during a search.
  if (searchQuery && keyCount === 0) return null;

  return (
    <div
      ref={sectionRef ?? null}
      className="rounded-xl border overflow-hidden"
      style={{
        background: "#1a1a1a",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      {/* Section header */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
        onClick={() => onToggle(namespace)}
        aria-expanded={isOpen}
        aria-controls={`section-${namespace}`}
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            size={14}
            className="shrink-0 transition-transform duration-150"
            style={{
              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
              color: "rgba(244,244,245,0.4)",
            }}
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-white font-mono">
            {namespace}
          </span>
        </div>
        <span
          className="text-xs font-mono"
          style={{ color: "rgba(244,244,245,0.35)" }}
        >
          {searchQuery && keyCount !== totalCount
            ? `${keyCount} / ${totalCount} açar`
            : `${totalCount} açar`}
        </span>
      </button>

      {/* Section entries */}
      {visibleEntries.length > 0 && (
        <div
          id={`section-${namespace}`}
          className="border-t divide-y"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          {visibleEntries.map(([key, value]) => (
            <FieldRow
              key={key}
              dotKey={key}
              value={value}
              onChange={onChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FieldRow sub-component
// ---------------------------------------------------------------------------

type FieldRowProps = {
  dotKey: string;
  value: string;
  onChange: (key: string, value: string) => void;
};

/** Display only the portion of the key after the first dot segment. */
function shortKey(dotKey: string): string {
  const idx = dotKey.indexOf(".");
  return idx === -1 ? dotKey : dotKey.slice(idx + 1);
}

function FieldRow({ dotKey, value, onChange }: FieldRowProps) {
  const isLong = value.length > 50;
  const inputId = `field-${dotKey}`;

  return (
    <div className="grid grid-cols-[1fr_2fr] gap-3 px-4 py-3 items-start">
      {/* Key label */}
      <label
        htmlFor={inputId}
        className="text-xs font-mono pt-1.5 break-all"
        style={{ color: "rgba(244,244,245,0.45)" }}
      >
        {shortKey(dotKey)}
      </label>

      {/* Value input */}
      {isLong ? (
        <textarea
          id={inputId}
          rows={3}
          value={value}
          onChange={(e) => onChange(dotKey, e.target.value)}
          className="w-full rounded-md px-2.5 py-1.5 text-sm text-white resize-y focus:outline-none focus:ring-1"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderWidth: "1px",
            borderColor: "rgba(255,255,255,0.1)",
          }}
        />
      ) : (
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(dotKey, e.target.value)}
          className="w-full rounded-md px-2.5 py-1.5 text-sm text-white focus:outline-none focus:ring-1"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderWidth: "1px",
            borderColor: "rgba(255,255,255,0.1)",
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MessagesEditor
// ---------------------------------------------------------------------------

export function MessagesEditor({ locale, initialFlat, initialSection }: Props) {
  // ----- state -----
  const [flat, setFlat] = useState<Record<string, string>>(initialFlat);
  const [searchQuery, setSearchQuery] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Build namespace order once from initialFlat keys to keep sections stable.
  const namespaceOrder = useMemo(() => {
    const seen = new Set<string>();
    for (const key of Object.keys(initialFlat)) {
      const ns = key.includes(".") ? key.slice(0, key.indexOf(".")) : key;
      seen.add(ns);
    }
    return Array.from(seen);
  }, [initialFlat]);

  // Determine initially open sections — prefer URL section param, else all
  // closed by default.
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    if (initialSection) return new Set([initialSection]);
    return new Set<string>();
  });

  // Refs for scrolling to the URL-specified section.
  const sectionRefs = useRef<Map<string, MutableRefObject<HTMLDivElement | null>>>(
    new Map(),
  );

  // Ensure a ref exists for every namespace.
  for (const ns of namespaceOrder) {
    if (!sectionRefs.current.has(ns)) {
      sectionRefs.current.set(ns, { current: null });
    }
  }

  // Scroll to the initial section once on mount.
  useEffect(() => {
    if (!initialSection) return;
    const ref = sectionRefs.current.get(initialSection);
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Run once — initialSection does not change after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- derived data -----
  const groups = useMemo(() => groupByNamespace(flat), [flat]);

  // ----- handlers -----
  const handleToggle = useCallback((ns: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(ns)) next.delete(ns);
      else next.add(ns);
      return next;
    });
  }, []);

  const handleChange = useCallback((key: string, value: string) => {
    setFlat((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/admin/messages/${locale}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flat }),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setErrorMessage(json.error ?? "Xəta baş verdi.");
        setSaveState("error");
        return;
      }

      setSaveState("success");
      // Auto-reset to idle after 3 s.
      setTimeout(() => setSaveState("idle"), 3000);
    } catch {
      setErrorMessage("Şəbəkə xətası. Yenidən cəhd edin.");
      setSaveState("error");
    }
  }, [flat, locale]);

  // ----- render -----
  return (
    <div className="flex flex-col gap-5">
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "rgba(244,244,245,0.3)" }}
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Axtar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-1"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderWidth: "1px",
            borderColor: "rgba(255,255,255,0.1)",
          }}
          aria-label="Açarları axtar"
        />
      </div>

      {/* Section panels */}
      <div className="flex flex-col gap-3">
        {namespaceOrder.map((ns) => {
          const entries = groups.get(ns);
          if (!entries) return null;

          return (
            <SectionPanel
              key={ns}
              namespace={ns}
              entries={entries}
              isOpen={openSections.has(ns)}
              searchQuery={searchQuery}
              onToggle={handleToggle}
              onChange={handleChange}
              sectionRef={
                sectionRefs.current.get(ns) as MutableRefObject<HTMLDivElement | null>
              }
            />
          );
        })}
      </div>

      {/* Save bar */}
      <div className="sticky bottom-0 flex items-center justify-between gap-4 rounded-xl border px-4 py-3"
        style={{
          background: "#111111",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {/* Feedback messages */}
        <div aria-live="polite" aria-atomic="true" className="text-sm">
          {saveState === "success" && (
            <span style={{ color: "#4ade80" }}>Yadda saxlandı</span>
          )}
          {saveState === "error" && (
            <span style={{ color: "#f87171" }}>{errorMessage}</span>
          )}
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            saveState === "saving" && "opacity-60 cursor-not-allowed",
          )}
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "#f4f4f5",
          }}
          aria-busy={saveState === "saving"}
        >
          <Save size={14} aria-hidden="true" />
          {saveState === "saving" ? "Saxlanılır..." : "Saxla"}
        </button>
      </div>
    </div>
  );
}
