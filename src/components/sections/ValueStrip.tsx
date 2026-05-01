import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

export async function ValueStrip({
  tKey = "valueStrip",
  variant = "primary",
}: {
  /** i18n namespace exposing a `line` key. Lets the same strip render with
   *  different copy at different points on the page. */
  tKey?: "valueStrip" | "aboutStrip";
  /**
   * Visual loudness. The page renders two strips back-to-back; the second
   * uses `secondary` so the duplication doesn't read as a stutter — smaller
   * type, no border-y, looser tracking, dimmer color.
   */
  variant?: "primary" | "secondary";
} = {}) {
  const t = await getTranslations(tKey);

  const isSecondary = variant === "secondary";

  return (
    <div
      className={cn(
        "relative z-10 py-4 sm:py-5",
        isSecondary
          ? "bg-transparent"
          : "border-y border-white/[0.06] bg-[#05060a]/40 backdrop-blur-sm",
      )}
    >
      <Reveal>
        <p
          className={cn(
            "text-center font-mono uppercase transition-colors duration-300 ease-out hover:text-cyan-200/85",
            isSecondary
              ? "text-[0.6875rem] tracking-[0.42em] text-text-tertiary sm:tracking-[0.5em]"
              : "text-xs tracking-[0.28em] text-text-tertiary sm:tracking-[0.32em]",
          )}
        >
          {t("line")}
        </p>
      </Reveal>
    </div>
  );
}
