"use client";

import { useState, useTransition } from "react";
import type { StorageUsage } from "@/lib/admin/blob";

type Props = {
  usage: StorageUsage;
  onCleanup: () => Promise<{ deleted: number }>;
};

export function StorageMeter({ usage, onCleanup }: Props) {
  const { usedMB, usedPercent, isWarning, isCritical } = usage;
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ deleted: number } | null>(null);

  const barColor = isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#22c55e";
  const labelColor = isCritical
    ? "#fca5a5"
    : isWarning
      ? "#fcd34d"
      : "rgba(244,244,245,0.4)";

  function handleCleanup() {
    setResult(null);
    startTransition(async () => {
      const res = await onCleanup();
      setResult(res);
    });
  }

  return (
    <div
      className="px-3 py-3 border-t"
      style={{ borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs" style={{ color: "rgba(244,244,245,0.4)" }}>
          Yaddaş
        </span>
        <span className="text-xs font-mono" style={{ color: labelColor }}>
          {usedMB.toFixed(1)} / 500 MB
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)" }}
        role="progressbar"
        aria-valuenow={Math.round(usedPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Yaddaş istifadəsi: ${usedMB.toFixed(1)} MB / 500 MB`}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(usedPercent, 100)}%`,
            background: barColor,
          }}
        />
      </div>

      {/* Warning messages */}
      {isCritical && (
        <p className="mt-1.5 text-xs leading-tight" style={{ color: "#fca5a5" }}>
          Yaddaş kritik həddədir. Köhnə faylları silin.
        </p>
      )}
      {isWarning && !isCritical && (
        <p className="mt-1.5 text-xs leading-tight" style={{ color: "#fcd34d" }}>
          Yaddaş 70%-dən çoxdur.
        </p>
      )}

      {/* Cleanup button */}
      <button
        onClick={handleCleanup}
        disabled={isPending}
        className="mt-2 w-full rounded text-xs py-1 transition-opacity disabled:cursor-not-allowed"
        style={{
          background: "rgba(255,255,255,0.05)",
          color: isPending
            ? "rgba(244,244,245,0.25)"
            : "rgba(244,244,245,0.4)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {isPending ? "Təmizlənir…" : "Boş faylları sil"}
      </button>

      {result !== null && (
        <p
          className="mt-1.5 text-xs text-center"
          style={{ color: "rgba(244,244,245,0.4)" }}
        >
          {result.deleted === 0
            ? "Silinəcək fayl tapılmadı"
            : `${result.deleted} fayl silindi`}
        </p>
      )}
    </div>
  );
}
