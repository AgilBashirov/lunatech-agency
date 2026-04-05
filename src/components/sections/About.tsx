import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "@/components/ui/Section";

export async function About() {
  const t = await getTranslations("about");

  return (
    <Section id="about" className="z-10 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="bg-cyber-grid absolute inset-0" aria-hidden />
        <div
          className="animate-sweep absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            {t("title")}
          </h2>
          <div className="mt-8 space-y-8">
            <div>
              <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-purple-300/90">
                {t("missionTitle")}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-zinc-400">
                {t("mission")}
              </p>
            </div>
            <div>
              <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-cyan-300/90">
                {t("philosophyTitle")}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-zinc-400">
                {t("philosophy")}
              </p>
            </div>
            <div>
              <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-purple-300/90">
                {t("whyTitle")}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-zinc-400">
                {t("why")}
              </p>
            </div>
          </div>
          <p className="mt-10 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            {t("tagline")}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto max-w-md lg:mx-0 lg:max-w-none">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-purple-600/20 via-transparent to-cyan-500/15 blur-2xl" />
            <GlassCard interactive={false} className="relative border-white/[0.1]">
              <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl" />
                  <Image
                    src="/brand/logo.svg"
                    alt=""
                    width={200}
                    height={200}
                    className="relative h-14 w-auto max-w-[240px] drop-shadow-[0_0_24px_rgba(255,255,255,0.35)]"
                    unoptimized
                  />
                </div>
                <div className="space-y-3">
                  <div className="inline-flex rounded-lg border border-white/[0.08] bg-[#05060a]/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-200/80">
                    LUNAR.FRAGMENT
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {t("moonBlurb")}
                  </p>
                </div>
                <div className="flex w-full gap-2">
                  <div className="h-16 flex-1 rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-transparent backdrop-blur-md" />
                  <div className="h-16 flex-1 rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent backdrop-blur-md" />
                  <div className="h-16 flex-1 rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-transparent backdrop-blur-md" />
                </div>
              </div>
            </GlassCard>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
