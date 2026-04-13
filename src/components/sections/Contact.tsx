"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/cn";
import { motionTransition } from "@/lib/motion";

const MAIL = "hello@lunatech.agency";

function FloatInput({
  id,
  label,
  className,
  ...props
}: {
  id: string;
  label: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative pt-2", className)}>
      <input
        id={id}
        placeholder=" "
        className="peer w-full border-0 border-b border-white/20 bg-transparent py-3 text-base text-white outline-none transition-[border-color] duration-300 ease-out focus:border-b-cyan-400/55 focus:shadow-none md:text-sm"
        {...props}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-5 text-sm text-zinc-200 transition-all duration-300 ease-out peer-focus:-top-0 peer-focus:text-[10px] peer-focus:font-mono peer-focus:uppercase peer-focus:tracking-[0.2em] peer-focus:text-cyan-400/90 peer-[:not(:placeholder-shown)]:-top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-mono peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.2em] peer-[:not(:placeholder-shown)]:text-zinc-200"
      >
        {label}
      </label>
    </div>
  );
}

function FloatTextarea({
  id,
  label,
  ...props
}: {
  id: string;
  label: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="relative pt-2">
      <textarea
        id={id}
        placeholder=" "
        rows={4}
        className="peer w-full resize-none border-0 border-b border-white/20 bg-transparent py-3 text-base text-white outline-none transition-[border-color] duration-300 ease-out focus:border-b-cyan-400/55 focus:shadow-none md:text-sm"
        {...props}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-5 text-sm text-zinc-200 transition-all duration-300 ease-out peer-focus:-top-0 peer-focus:text-[10px] peer-focus:font-mono peer-focus:uppercase peer-focus:tracking-[0.2em] peer-focus:text-cyan-400/90 peer-[:not(:placeholder-shown)]:-top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-mono peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.2em] peer-[:not(:placeholder-shown)]:text-zinc-200"
      >
        {label}
      </label>
    </div>
  );
}

export function Contact() {
  const t = useTranslations("contact");
  const reduce = useReducedMotion();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submitMailto = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const subject = encodeURIComponent(`Lunatech — ${name || "Contact"}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`,
      );
      window.location.href = `mailto:${MAIL}?subject=${subject}&body=${body}`;
    },
    [name, email, message],
  );

  return (
    <Section id="contact" className="z-10 pb-20 sm:pb-28">
      <div className="mx-auto w-full max-w-lg">
        <motion.div
          initial={reduce ? false : { opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={motionTransition.smooth}
          className="text-center"
        >
          <h2 className="text-gradient-heading text-3xl font-bold tracking-tight md:text-4xl drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]">
            {t("title")}
          </h2>
          <p className="mt-3 text-balance break-words text-zinc-300">
            {t("subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ ...motionTransition.smooth, delay: 0.06 }}
          className="relative mt-10"
        >
          <GlassCard
            interactive={false}
            disableBackdropBlur
            className="relative z-[1] overflow-hidden border-white/[0.12] bg-[#0b0f1a]/96 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          >
            <form onSubmit={submitMailto} className="flex flex-col gap-8">
              <FloatInput
                id="contact-name"
                name="name"
                label={t("formName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <FloatInput
                id="contact-email"
                name="email"
                type="email"
                label={t("formEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <FloatTextarea
                id="contact-message"
                name="message"
                label={t("formMessage")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex flex-col items-center gap-3 pt-2">
                <div className="rounded-full">
                  <Button type="submit" subtleGlow>
                    {t("formSubmit")}
                  </Button>
                </div>
                <p className="text-center text-xs text-zinc-400">{t("formNote")}</p>
                <p className="text-center text-xs text-zinc-500">{t("mailtoHint")}</p>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </Section>
  );
}
