"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";

export type ProjectKey =
  | "project1"
  | "project2"
  | "project3"
  | "project4"
  | "project5"
  | "project6";

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
        <Dialog.Content className="fixed z-[101] max-h-[85dvh] w-[min(92vw,560px)] overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#0b0f1a]/95 p-6 shadow-[0_0_60px_rgba(124,58,237,0.2)] backdrop-blur-xl outline-none max-sm:inset-x-4 max-sm:top-[max(1rem,env(safe-area-inset-top,0px))] max-sm:w-auto max-sm:max-h-[min(88dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem))] max-sm:translate-x-0 max-sm:translate-y-0 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 md:p-8">
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
              <Dialog.Description className="mt-6 text-base leading-relaxed text-zinc-400 sm:text-sm">
                {t(`${project}.body`)}
              </Dialog.Description>
            </>
          ) : null}
          <div className="mt-8 flex justify-end">
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
