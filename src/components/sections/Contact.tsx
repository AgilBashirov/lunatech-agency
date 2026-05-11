"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  useId,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
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
type FieldError = "required" | "phone" | "email";
type Status = "idle" | "submitting" | "success" | "error";

type FormState = {
  name: string;
  email: string;
  phone: string;
  service: ServiceId | "";
  otherMessage: string;
  message: string;
  /** Honeypot — never displayed; if non-empty the API silently drops the submission. */
  hp: string;
};

// Per-field length caps. Mirror /api/contact MAX so the browser and server
// agree; the API is still the source of truth.
const MAX = {
  name: 100,
  phone: 40,
  email: 120,
  otherMessage: 500,
  message: 2000,
} as const;

const PHONE_RE = /^[+\d][\d\s\-()]{8,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  service: "",
  otherMessage: "",
  message: "",
  hp: "",
};

// Shared input/select/textarea bottom-border styles. Kept as a constant so all
// three controls stay in lockstep and the "invalid" variant only flips the
// border colour without re-listing every other rule. `focus-visible:shadow-none`
// suppresses the global double-ring focus indicator (globals.css) for these
// minimalist underlined controls — the bottom-border colour change alone
// indicates focus.
const controlBase =
  "peer block w-full border-0 border-b bg-transparent py-3 text-base text-white outline-none transition-[border-color] duration-300 ease-out focus-visible:shadow-none md:text-sm";
const controlBorder = "border-white/20 focus:border-b-cyan-400/55";
const controlBorderInvalid = "border-red-400/70 focus:border-b-red-400";

const labelBase =
  "pointer-events-none absolute left-0 top-5 text-sm text-text-secondary transition-all duration-300 ease-out";
const labelLifted =
  "peer-focus:-top-0 peer-focus:text-[10px] peer-focus:font-mono peer-focus:uppercase peer-focus:tracking-[0.2em] peer-focus:text-cyan-400/90 peer-[:not(:placeholder-shown)]:-top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-mono peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.2em] peer-[:not(:placeholder-shown)]:text-text-secondary";

function LabelText({
  label,
  required,
}: {
  label: ReactNode;
  required?: boolean;
}) {
  return (
    <>
      {label}
      {required && (
        // Inherit the label's current colour (secondary at rest, cyan when
        // focused) so the asterisk reads as part of the label rather than a
        // separate decoration.
        <span aria-hidden className="ml-0.5">
          *
        </span>
      )}
    </>
  );
}

type FieldAriaProps = {
  errorText?: string;
  hintText?: string;
  required?: boolean;
};

function useFieldAria(
  id: string,
  { errorText, hintText, required }: FieldAriaProps,
) {
  const errorId = errorText ? `${id}-error` : undefined;
  const hintId = hintText ? `${id}-hint` : undefined;
  const describedBy =
    [errorId, hintId].filter(Boolean).join(" ") || undefined;
  return {
    "aria-invalid": errorText ? true : undefined,
    "aria-errormessage": errorId,
    "aria-describedby": describedBy,
    "aria-required": required || undefined,
    errorId,
    hintId,
  } as const;
}

function FieldHelp({
  errorId,
  errorText,
  hintId,
  hintText,
}: {
  errorId?: string;
  errorText?: string;
  hintId?: string;
  hintText?: string;
}) {
  if (!errorText && !hintText) return null;
  return (
    <div className="mt-1 flex flex-col gap-0.5 text-xs">
      {errorText && (
        <p id={errorId} role="alert" className="text-red-300">
          {errorText}
        </p>
      )}
      {hintText && (
        <p id={hintId} className="text-text-tertiary">
          {hintText}
        </p>
      )}
    </div>
  );
}

function FloatInput({
  id,
  label,
  errorText,
  hintText,
  required,
  className,
  ...props
}: {
  id: string;
  label: string;
} & FieldAriaProps &
  InputHTMLAttributes<HTMLInputElement>) {
  const aria = useFieldAria(id, { errorText, hintText, required });
  return (
    <div className={cn("relative pt-2", className)}>
      <input
        id={id}
        placeholder=" "
        required={required}
        aria-invalid={aria["aria-invalid"]}
        aria-errormessage={aria["aria-errormessage"]}
        aria-describedby={aria["aria-describedby"]}
        aria-required={aria["aria-required"]}
        className={cn(
          controlBase,
          errorText ? controlBorderInvalid : controlBorder,
        )}
        {...props}
      />
      <label htmlFor={id} className={cn(labelBase, labelLifted)}>
        <LabelText label={label} required={required} />
      </label>
      <FieldHelp
        errorId={aria.errorId}
        errorText={errorText}
        hintId={aria.hintId}
        hintText={hintText}
      />
    </div>
  );
}

function FloatTextarea({
  id,
  label,
  errorText,
  hintText,
  required,
  ...props
}: {
  id: string;
  label: string;
} & FieldAriaProps &
  TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const aria = useFieldAria(id, { errorText, hintText, required });
  return (
    <div className="relative pt-2">
      <textarea
        id={id}
        placeholder=" "
        rows={4}
        required={required}
        aria-invalid={aria["aria-invalid"]}
        aria-errormessage={aria["aria-errormessage"]}
        aria-describedby={aria["aria-describedby"]}
        aria-required={aria["aria-required"]}
        className={cn(
          controlBase,
          "resize-none",
          errorText ? controlBorderInvalid : controlBorder,
        )}
        {...props}
      />
      <label htmlFor={id} className={cn(labelBase, labelLifted)}>
        <LabelText label={label} required={required} />
      </label>
      <FieldHelp
        errorId={aria.errorId}
        errorText={errorText}
        hintId={aria.hintId}
        hintText={hintText}
      />
    </div>
  );
}

function FloatSelect({
  id,
  label,
  value,
  errorText,
  hintText,
  required,
  onFocus,
  onBlur,
  children,
  ...props
}: {
  id: string;
  label: string;
  value: string;
} & FieldAriaProps &
  SelectHTMLAttributes<HTMLSelectElement>) {
  // Native <select> can't drive the floating label via :placeholder-shown
  // because <select> has no placeholder pseudo. Treat "empty value OR focus"
  // as the lifted state and toggle the label class manually.
  const [focused, setFocused] = useState(false);
  const lifted = focused || value !== "";
  const aria = useFieldAria(id, { errorText, hintText, required });
  return (
    <div>
      {/* Inner wrapper carries pt-2 so the label's `top-0` (lifted) and
          `top-5` (resting) anchor against the SAME reference frame as
          FloatInput — otherwise the lifted state would sit 8px lower than
          the input's lifted label, visually breaking the column. */}
      <div className="relative pt-2">
        <select
          id={id}
          value={value}
          required={required}
          aria-invalid={aria["aria-invalid"]}
          aria-errormessage={aria["aria-errormessage"]}
          aria-describedby={aria["aria-describedby"]}
          aria-required={aria["aria-required"]}
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
            errorText ? controlBorderInvalid : controlBorder,
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
            focused ? "text-cyan-400/90" : "text-text-secondary",
          )}
        >
          <LabelText label={label} required={required} />
        </label>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute right-0 top-7 size-4 -translate-y-1/2 text-text-secondary"
        >
          <path d="M6 9 L12 15 L18 9" />
        </svg>
      </div>
      <FieldHelp
        errorId={aria.errorId}
        errorText={errorText}
        hintId={aria.hintId}
        hintText={hintText}
      />
    </div>
  );
}

function Spinner() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4 animate-spin"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12 a9 9 0 0 0 -9 -9" />
    </svg>
  );
}

export function Contact() {
  const t = useTranslations("contact");
  const tServices = useTranslations("contact.services");
  const tErrors = useTranslations("contact.errors");
  const reduce = useReducedMotion();
  const formId = useId();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<FieldName, FieldError>>>(
    {},
  );
  const [status, setStatus] = useState<Status>("idle");

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (key in prev) {
        const next = { ...prev };
        delete next[key as FieldName];
        return next;
      }
      return prev;
    });
  };

  const validate = (
    state: FormState,
  ): Partial<Record<FieldName, FieldError>> => {
    const next: Partial<Record<FieldName, FieldError>> = {};
    if (!state.name.trim()) next.name = "required";
    if (!state.phone.trim()) next.phone = "required";
    else if (!PHONE_RE.test(state.phone.trim())) next.phone = "phone";
    if (!state.service) next.service = "required";
    if (state.service === "other" && !state.otherMessage.trim()) {
      next.otherMessage = "required";
    }
    if (state.email && !EMAIL_RE.test(state.email.trim())) {
      next.email = "email";
    }
    return next;
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setStatus("idle");
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

  const errorTextFor = (field: FieldName): string | undefined =>
    errors[field] ? tErrors(errors[field] as FieldError) : undefined;

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
                <button
                  type="button"
                  onClick={reset}
                  className="mt-1 text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-400/90 transition-colors duration-200 hover:text-cyan-300"
                >
                  {t("sendAnother")}
                </button>
              </div>
            ) : (
              <form
                onSubmit={submit}
                noValidate
                className="flex flex-col gap-8"
              >
                {/* Honeypot — visually hidden, off-tab, never autofilled. Spam
                    bots blindly fill every input; a non-empty value here causes
                    the API to silently drop the submission. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
                >
                  <label htmlFor={`${formId}-hp`}>Leave blank</label>
                  <input
                    id={`${formId}-hp`}
                    type="text"
                    name="hp"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.hp}
                    onChange={(e) => update("hp", e.target.value)}
                  />
                </div>

                <FloatInput
                  id={`${formId}-name`}
                  name="name"
                  label={t("formName")}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  autoComplete="name"
                  maxLength={MAX.name}
                  required
                  errorText={errorTextFor("name")}
                />

                <FloatInput
                  id={`${formId}-email`}
                  name="email"
                  type="email"
                  label={t("formEmail")}
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  autoComplete="email"
                  maxLength={MAX.email}
                  errorText={errorTextFor("email")}
                />

                <FloatInput
                  id={`${formId}-phone`}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  label={t("formPhone")}
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  autoComplete="tel"
                  maxLength={MAX.phone}
                  required
                  errorText={errorTextFor("phone")}
                />

                <FloatSelect
                  id={`${formId}-service`}
                  name="service"
                  label={t("formService")}
                  value={form.service}
                  onChange={(e) =>
                    update("service", e.target.value as ServiceId | "")
                  }
                  required
                  errorText={errorTextFor("service")}
                >
                  {/* Empty option keeps the select on a placeholder state
                      without leaking text behind the floating label. */}
                  <option value="" disabled hidden></option>
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
                          maxLength={MAX.otherMessage}
                          required
                          rows={3}
                          errorText={errorTextFor("otherMessage")}
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
                  maxLength={MAX.message}
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
                    className="disabled:opacity-60"
                  >
                    {status === "submitting" ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner />
                        {t("submitting")}
                      </span>
                    ) : (
                      t("formSubmit")
                    )}
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
