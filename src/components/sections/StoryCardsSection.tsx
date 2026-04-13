"use client";

import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./StoryCardsSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const INACTIVE_SCALE = 0.93;
const INACTIVE_Y_PERCENT = 8;
/** Text fades faster than the card shell to reduce overlap while scrubbing. */
const INNER_FADE_OUT_DUR = 0.28;
const INNER_FADE_IN_START = 0.18;
const INNER_FADE_IN_DUR = 0.48;

export function StoryCardsSection() {
  const aboutT = useTranslations("about");
  const approachT = useTranslations("approach");
  const processT = useTranslations("process");
  const sectionRef = useRef<HTMLElement | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stack = stackRef.current;
    if (!section || !stack) {
      return;
    }

    const cards = gsap.utils.toArray<HTMLElement>("[data-story-card]", stack);
    const inners = gsap.utils.toArray<HTMLElement>(
      "[data-story-card-content]",
      stack,
    );
    if (cards.length !== 3 || inners.length !== 3) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(cards, {
        autoAlpha: 0,
        yPercent: INACTIVE_Y_PERCENT,
        scale: INACTIVE_SCALE,
        force3D: true,
      });
      gsap.set(cards[0], { autoAlpha: 1, yPercent: 0, scale: 1 });
      gsap.set(inners, { autoAlpha: 0, force3D: true });
      gsap.set(inners[0], { autoAlpha: 1 });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * 2.4}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(
          cards[0],
          { autoAlpha: 0, yPercent: -INACTIVE_Y_PERCENT, scale: INACTIVE_SCALE },
          0,
        )
        .to(cards[1], { autoAlpha: 1, yPercent: 0, scale: 1 }, 0)
        .to(inners[0], { autoAlpha: 0, duration: INNER_FADE_OUT_DUR }, 0)
        .fromTo(
          inners[1],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: INNER_FADE_IN_DUR },
          INNER_FADE_IN_START,
        )
        .to(
          cards[1],
          { autoAlpha: 0, yPercent: -INACTIVE_Y_PERCENT, scale: INACTIVE_SCALE },
          1,
        )
        .to(cards[2], { autoAlpha: 1, yPercent: 0, scale: 1 }, 1)
        .to(inners[1], { autoAlpha: 0, duration: INNER_FADE_OUT_DUR }, 1)
        .fromTo(
          inners[2],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: INNER_FADE_IN_DUR },
          1 + INNER_FADE_IN_START,
        );
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} className={styles.section}>
      <div className={styles.viewport}>
        <div ref={stackRef} className={styles.stack}>
          <article data-story-card className={styles.card}>
            <div data-story-card-content className={styles.content}>
              <h2 className={styles.title}>{aboutT("title")}</h2>
              <div className={styles.body}>
                <p>{aboutT("p1")}</p>
                <p>{aboutT("p2")}</p>
                <p>{aboutT("p3")}</p>
              </div>
            </div>
          </article>

          <article data-story-card className={styles.card}>
            <div data-story-card-content className={styles.content}>
              <h2 className={styles.title}>{approachT("title")}</h2>
              <div className={styles.body}>
                <p>{approachT("p1")}</p>
                <p>{approachT("p2")}</p>
                <p>{approachT("p3")}</p>
              </div>
            </div>
          </article>

          <article data-story-card className={styles.card}>
            <div data-story-card-content className={styles.content}>
              <h2 className={styles.title}>{processT("title")}</h2>
              <div className={styles.body}>
                <p className={styles.steps}>
                  {processT("discover")} - {processT("design")} - {processT("build")} -{" "}
                  {processT("launch")}
                </p>
                <p>{processT("subtitle")}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
