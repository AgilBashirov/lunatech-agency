"use client";

import type Lenis from "lenis";
import { useEffect, useRef } from "react";
import { useLenis } from "@/context/lenis-context";
import { getScrollYToCenterElement } from "@/lib/smoothScroll";

function scrollToHashCentered(lenis: Lenis, id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      lenis.scrollTo(getScrollYToCenterElement(el), {
        programmatic: true,
        force: true,
      });
    });
  });
}

/**
 * Lenis aktiv olanda brauzerin default `#anchor` davranışı ilə sinxron deyil.
 * Klik və ilkin `location.hash` üçün hədəf bölməni viewportun şaquli mərkəzinə
 * yaxınlaşdırırıq ki, istifadəçi həmin blokun UI-ni rahat görsün.
 *
 * İlkin yükləmə: Lenis hazır olanda bir dəfə `scrollTo` (ikiqat scroll yoxdur).
 */
export function HashScrollOnAnchors() {
  const lenis = useLenis();
  const initialHashDoneRef = useRef(false);

  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr || !hrefAttr.startsWith("#")) return;

      const id = hrefAttr.slice(1);
      if (!id) return;

      const targetEl = document.getElementById(id);
      if (!targetEl) return;

      e.preventDefault();

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!lenis) {
        targetEl.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        window.history.replaceState(null, "", `#${id}`);
        return;
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          lenis.scrollTo(getScrollYToCenterElement(targetEl), {
            programmatic: true,
            force: true,
          });
          window.history.replaceState(null, "", `#${id}`);
        });
      });
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [lenis]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (initialHashDoneRef.current) return;
      initialHashDoneRef.current = true;
      const id = hash.slice(1);
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "auto", block: "center" });
      return;
    }

    if (!lenis) return;
    if (initialHashDoneRef.current) return;
    initialHashDoneRef.current = true;

    scrollToHashCentered(lenis, hash.slice(1));
  }, [lenis]);

  return null;
}
