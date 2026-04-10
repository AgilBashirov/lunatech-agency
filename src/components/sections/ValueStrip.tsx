import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";

export async function ValueStrip() {
  const t = await getTranslations("valueStrip");

  return (
    <div className="relative z-10 border-y border-white/[0.06] bg-[#05060a]/40 py-4 backdrop-blur-sm sm:py-5">
      <Reveal>
        <p className="text-center font-mono text-xs uppercase tracking-[0.28em] text-zinc-400 transition-colors duration-300 ease-out hover:text-cyan-200/85 sm:tracking-[0.32em]">
          {t("line")}
        </p>
      </Reveal>
    </div>
  );
}
