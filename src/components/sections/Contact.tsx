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
        className="peer w-full border-0 border-b border-white/[0.12] bg-transparent py-3 text-base text-white outline-none transition-[border-color] duration-300 ease-out focus:border-b-cyan-400/55 focus:shadow-none md:text-sm"
        {...props}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-5 text-sm text-zinc-400 transition-all duration-300 ease-out peer-focus:-top-0 peer-focus:text-[10px] peer-focus:font-mono peer-focus:uppercase peer-focus:tracking-[0.2em] peer-focus:text-cyan-400/90 peer-[:not(:placeholder-shown)]:-top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-mono peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.2em] peer-[:not(:placeholder-shown)]:text-zinc-300"
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
        className="peer w-full resize-y border-0 border-b border-white/[0.12] bg-transparent py-3 text-base text-white outline-none transition-[border-color] duration-300 ease-out focus:border-b-cyan-400/55 focus:shadow-none md:text-sm"
        {...props}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-5 text-sm text-zinc-400 transition-all duration-300 ease-out peer-focus:-top-0 peer-focus:text-[10px] peer-focus:font-mono peer-focus:uppercase peer-focus:tracking-[0.2em] peer-focus:text-cyan-400/90 peer-[:not(:placeholder-shown)]:-top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-mono peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.2em] peer-[:not(:placeholder-shown)]:text-zinc-300"
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
      <div className="mx-auto max-w-lg">
        <motion.div
          initial={reduce ? false : { opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={motionTransition.smooth}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-zinc-300">{t("subtitle")}</p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ ...motionTransition.smooth, delay: 0.06 }}
          className="relative mt-10"
        >
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[min(100%,22rem)] w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-[radial-gradient(ellipse_55%_42%_at_50%_58%,rgba(124,58,237,0.1),transparent_68%),radial-gradient(ellipse_40%_35%_at_50%_72%,rgba(34,211,238,0.06),transparent_65%)]"
            aria-hidden
          />
          <GlassCard interactive={false} className="relative border-white/[0.1]">
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
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </Section>
  );
}
