"use client";

import { useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useState } from "react";
import { useLenis } from "@/context/lenis-context";
import { isContactInViewport } from "@/lib/scrollTopFabVisibility";
import { scrollToElementWithLenis, scrollToTopWithLenis } from "@/lib/smoothScroll";
import styles from "./ScrollToTopButton.module.css";

/**
 * FAB visibility: `#contact` intersects the viewport (IntersectionObserver).
 * Scrolling up until contact leaves upward → `isIntersecting` false on the same frame
 * (no timers); hide is immediate in state, smoothness comes from CSS opacity/transform.
 */
export function ScrollToTopButton() {
  const lenis = useLenis();
  const reduce = useReducedMotion();
  const t = useTranslations("nav");
  const reactId = useId();
  const gradId = `scroll-top-ic-${reactId.replace(/:/g, "")}`;

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const contact = document.getElementById("contact");
    if (!(contact instanceof HTMLElement)) {
      const id = requestAnimationFrame(() => {
        setVisible(false);
      });
      return () => cancelAnimationFrame(id);
    }

    const apply = () => {
      setVisible(isContactInViewport(contact));
    };

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) {
          return;
        }
        setVisible(e.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0,
      },
    );

    io.observe(contact);
    const syncId = requestAnimationFrame(() => apply());

    const onResize = () => apply();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(syncId);
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const onClick = useCallback(() => {
    const hero = document.getElementById("hero");
    if (hero) {
      scrollToElementWithLenis(hero, lenis, Boolean(reduce));
      // Don't write #hero to the URL — keeps reloads landing at top instead
      // of triggering an auto-scroll on the next refresh.
      return;
    }
    scrollToTopWithLenis(lenis, Boolean(reduce));
  }, [lenis, reduce]);

  return (
    <button
      type="button"
      className={styles.shell}
      data-visible={visible ? "true" : "false"}
      tabIndex={visible ? 0 : -1}
      aria-label={t("scrollToTop")}
      title={t("scrollToTop")}
      onClick={onClick}
    >
      <span className={styles.face}>
        <span className={styles.faceInner}>
          <span className={styles.iconWrap}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <path
                d="M5 15.25L12 7.75L19 15.25"
                stroke={`url(#${gradId})`}
                strokeWidth="2.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
    