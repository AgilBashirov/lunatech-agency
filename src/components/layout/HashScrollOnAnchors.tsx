"use client";

import type Lenis from "lenis";
import { useEffect, useRef } from "react";
import { useLenis } from "@/context/lenis-context";

/** Lenis + `scroll-padding` sonrası təxmini hizalanma düzəlişi (header alt sərhədi). */
const LENIS_ANCHOR_NUDGE_PX = -14;

function scrollToHashWithLenis(lenis: Lenis, id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      lenis.scrollTo(el, {
        offset: LENIS_ANCHOR_NUDGE_PX,
        programmatic: true,
        force: true,
      });
    });
  });
}

/**
 * Lenis aktiv olanda brauzerin `#anchor` keçidi `html` üzrə `scroll-padding` ilə
 * sinxron işləmir. `scrollTo(HTMLElement)` Lenis-in daxilində `scroll-margin` və
 * root `scroll-padding-top` çıxır ([globals.css](src/app/globals.css)).
 *
 * İlkin yükləmə: əvvəl `lenis === null` ikən `scrollIntoView` çağırmaq, sonra Lenis
 * gələndə yenidən `scrollTo` etmək ikiqat scroll yaradırdı — yalnız Lenis hazır olanda
 * bir dəfə scroll edirik.
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

      if (!lenis) {
        return;
      }

      e.preventDefault();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          lenis.scrollTo(targetEl, {
            offset: LENIS_ANCHOR_NUDGE_PX,
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
      el?.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }

    if (!lenis) return;
    if (initialHashDoneRef.current) return;
    initialHashDoneRef.current = true;

    scrollToHashWithLenis(lenis, hash.slice(1));
  }, [lenis]);

  return null;
}
