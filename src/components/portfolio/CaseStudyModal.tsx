"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import {
  AURA_DEMO_URLS,
  type PortfolioProjectKey,
} from "@/lib/portfolioDemos";

export type ProjectKey = PortfolioProjectKey;

type Props = {
  project: ProjectKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CaseStudyModal({ project, open, onOpenChange }: Props) {
  const t = useTranslations("portfolio");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-[6px] sm:backdrop-blur-sm" />
        <Dialog.Content className="fixed z-[101] max-h-[85dvh] w-[min(92vw,560px)] overflow-y-auto rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[0_0_60px_rgba(124,58,237,0.2)] backdrop-blur-xl outline-none max-sm:inset-x-4 max-sm:top-[max(1rem,env(safe-area-inset-top,0px))] max-sm:w-auto max-sm:max-h-[min(88dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem))] max-sm:translate-x-0 max-sm:translate-y-0 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 md:p-8">
          <Dialog.Title
            className={
              project
                ? "text-xl font-semibold tracking-tight text-white md:text-2xl"
                : "sr-only"
            }
          >
            {project ? t(`${project}.title`) : t("title")}
          </Dialog.Title>
          {project ? (
            <>
              <span className="mt-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-cyan-200">
                {t(`${project}.tag`)}
              </span>
              <Dialog.Description className="mt-6 text-sm leading-relaxed text-zinc-300 sm:text-base">
                {t(`${project}.body`)}
              </Dialog.Description>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                {t("demoNote")}
              </p>
              <a
                href={AURA_DEMO_URLS[project]}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-cyan-400/90 underline-offset-4 transition-colors hover:text-cyan-300 hover:underline"
              >
                {t(`${project}.demoLink`)}
                <span aria-hidden>↗</span>
              </a>
            </>
          ) : null}
          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Dialog.Close asChild>
              <button
                type="button"
                className="min-h-11 min-w-[44px] rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-300 ease-out hover:border-purple-400/35 hover:bg-white/10 touch-manipulation"
              >
                {t("modalClose")}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
