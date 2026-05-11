"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  useId,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "@/components/ui/Section";
import { SERVICE_OPTIONS, type ServiceId } from "@/data/services";
import { cn } from "@/lib/cn";
import { motionTransition } from "@/lib/motion";

type FieldName = "name" | "email" | "phone" | "service" | "otherMessage";
type Status = "idle" | "submitting" | "success" | "error";

type FormState = {
  name: string;
  email: string;
  phone: string;
  service: ServiceId | "";
  otherMessage: string;
  message: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  service: "",
  otherMessage: "",
  message: "",
};

// Shared input/select/textarea bottom-border styles. Kept as a constant so all
// three controls stay in lockstep and the "invalid" variant only flips the
// border colour without re-listing every other rule.
const controlBase =
  "peer block w-full border-0 border-b bg-transparent py-3 text-base text-white outline-none transition-[border-color] duration-300 ease-out md:text-sm";
const controlBorder = "border-white/20 focus:border-b-cyan-400/55";
const controlBorderInvalid = "border-red-400/70 focus:border-b-red-400";

const labelBase =
  "pointer-events-none absolute left-0 top-5 text-sm text-text-secondary transition-all duration-300 ease-out";
const labelLifted =
  "peer-focus:-top-0 peer-focus:text-[10px] peer-focus:font-mono peer-focus:uppercase peer-focus:tracking-[0.2em] peer-focus:text-cyan-400/90 peer-[:not(:placeholder-shown)]:-top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-mono peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.2em] peer-[:not(:placeholder-shown)]:text-text-secondary";

function FloatInput({
  id,
  label,
  invalid,
  className,
  ...props
}: {
  id: string;
  label: string;
  invalid?: boolean;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative pt-2", className)}>
      <input
        id={id}
        placeholder=" "
        aria-invalid={invalid || undefined}
        className={cn(controlBase, invalid ? controlBorderInvalid : controlBorder)}
        {...props}
      />
      <label htmlFor={id} className={cn(labelBase, labelLifted)}>
        {label}
      </label>
    </div>
  );
}

function FloatTextarea({
  id,
  label,
  invalid,
  ...props
}: {
  id: string;
  label: string;
  invalid?: boolean;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="relative pt-2">
      <textarea
        id={id}
        placeholder=" "
        rows={4}
        aria-invalid={invalid || undefined}
        className={cn(
          controlBase,
          "resize-none",
          invalid ? controlBorderInvalid : controlBorder,
        )}
        {...props}
      />
      <label htmlFor={id} className={cn(labelBase, labelLifted)}>
        {label}
      </label>
    </div>
  );
}

function FloatSelect({
  id,
  label,
  value,
  invalid,
  onFocus,
  onBlur,
  children,
  ...props
}: {
  id: string;
  label: string;
  value: string;
  invalid?: boolean;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  // Native <select> can't drive the floating label via :placeholder-shown
  // because <select> has no placeholder pseudo. Treat "empty value OR focus"
  // as the lifted state and toggle the label class manually.
  const [focused, setFocused] = useState(false);
  const lifted = focused || value !== "";
  return (
    <div className="relative pt-2">
      <select
        id={id}
        value={value}
        aria-invalid={invalid || undefined}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={cn(
          controlBase,
          "appearance-none pr-7",
          invalid ? controlBorderInvalid : controlBorder,
          // Style the dropdown panel for dark themes where the browser allows.
          "[&>option]:bg-[#0b0f1a] [&>option]:text-white",
        )}
        {...props}
      >
        {children}
      </select>
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-0 transition-all duration-300 ease-out",
          lifted
            ? "top-0 text-[10px] font-mono uppercase tracking-[0.2em]"
            : "top-5 text-sm",
          focused
            ? "text-cyan-400/90"
            : "text-text-secondary",
        )}
      >
        {label}
      </label>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 text-text-secondary"
      >
        <path d="M6 9 L12 15 L18 9" />
      </svg>
    </div>
  );
}

export function Contact() {
  const t = useTranslations("contact");
  const tServices = useTranslations("contact.services");
  const reduce = useReducedMotion();
  const formId = useId();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<FieldName, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const validate = (state: FormState): Partial<Record<FieldName, boolean>> => {
    const next: Partial<Record<FieldName, boolean>> = {};
    if (!state.name.trim()) next.name = true;
    if (!state.phone.trim()) next.phone = true;
    if (!state.service) next.service = true;
    if (state.service === "other" && !state.otherMessage.trim()) {
      next.otherMessage = true;
    }
    return next;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => null)) as
        | { success?: boolean }
        | null;
      if (res.ok && data?.success) {
        setStatus("success");
        setForm(EMPTY_FORM);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <Section id="contact" className="z-10 !scroll-mt-0">
      <div className="mx-auto w-full max-w-lg">
        <motion.div
          initial={reduce ? false : { opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={motionTransition.smooth}
          className="text-center"
        >
          <span className="t-eyebrow">{t("title")}</span>
          <h2 className="mt-3 text-foreground text-3xl font-bold tracking-tight md:text-4xl drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]">
            {t("title")}
          </h2>
          <p className="mt-3 text-balance break-words text-text-secondary">
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
            {status === "success" ? (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-center gap-3 py-4 text-center"
              >
                <span
                  aria-hidden
                  className="inline-flex size-10 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="M5 12.5 L10 17.5 L19 7.5" />
                  </svg>
                </span>
                <p className="t-body text-text-secondary">{t("success")}</p>
              </div>
            ) : (
              <form
                onSubmit={submit}
                noValidate
                className="flex flex-col gap-8"
              >
                <FloatInput
                  id={`${formId}-name`}
                  name="name"
                  label={t("formName")}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  autoComplete="name"
                  invalid={errors.name}
                />

                <FloatInput
                  id={`${formId}-email`}
                  name="email"
                  type="email"
                  label={t("formEmail")}
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  autoComplete="email"
                  invalid={errors.email}
                />

                <div>
                  <FloatInput
                    id={`${formId}-phone`}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    label={t("formPhone")}
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    autoComplete="tel"
                    invalid={errors.phone}
                  />
                  <p className="mt-1 text-xs text-text-tertiary">
                    {t("phoneHint")}
                  </p>
                </div>

                <FloatSelect
                  id={`${formId}-service`}
                  name="service"
                  label={t("formService")}
                  value={form.service}
                  onChange={(e) =>
                    update("service", e.target.value as ServiceId | "")
                  }
                  invalid={errors.service}
                >
                  <option value="" disabled hidden>
                    {t("servicePlaceholder")}
                  </option>
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {tServices(opt.id)}
                    </option>
                  ))}
                </FloatSelect>

                <AnimatePresence initial={false}>
                  {form.service === "other" && (
                    <motion.div
                      key="other-message"
                      initial={
                        reduce
                          ? { opacity: 1, height: "auto" }
                          : { opacity: 0, height: 0 }
                      }
                      animate={{ opacity: 1, height: "auto" }}
                      exit={
                        reduce
                          ? { opacity: 1, height: "auto" }
                          : { opacity: 0, height: 0 }
                      }
                      transition={motionTransition.smooth}
                      className="overflow-hidden"
                    >
                      {/* Inner wrapper carries the spacing so the parent can
                          animate to height: 0 without an end-frame gap. */}
                      <div className="pt-1">
                        <FloatTextarea
                          id={`${formId}-other`}
                          name="otherMessage"
                          label={t("otherHint")}
                          value={form.otherMessage}
                          onChange={(e) =>
                            update("otherMessage", e.target.value)
                          }
                          invalid={errors.otherMessage}
                          rows={3}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <FloatTextarea
                  id={`${formId}-message`}
                  name="message"
                  label={t("formMessage")}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                />

                {status === "error" && (
                  <p
                    role="alert"
                    className="-mt-2 text-center text-sm text-red-300"
                  >
                    {t("errorSubmit")}
                  </p>
                )}

                <div className="flex flex-col items-center gap-4">
                  <Button
                    type="submit"
                    subtleGlow
                    disabled={status === "submitting"}
                  >
                    {status === "submitting"
                      ? t("submitting")
                      : t("formSubmit")}
                  </Button>
                </div>
              </form>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </Section>
  );
}
