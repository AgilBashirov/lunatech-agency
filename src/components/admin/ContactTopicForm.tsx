"use client";

/**
 * ContactTopicForm — client component for creating/editing contact topics.
 *
 * Uses useActionState (React 19) so the server action returns a FormActionResult
 * instead of calling redirect(). On success the component navigates via
 * router.push() to avoid the "Router action dispatched before initialization"
 * bug triggered by Adblock Plus hydration mismatches.
 */

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ContactTopic } from "@/lib/admin/types";
import type { FormActionResult } from "@/lib/admin/types";

// ---------------------------------------------------------------------------
// Shared form fields
// ---------------------------------------------------------------------------

export function TopicFormFields({
  defaults,
}: {
  defaults?: Partial<ContactTopic>;
}) {
  return (
    <>
      <TopicField
        name="id"
        label="ID (slug)"
        hint='Kebab-case, məs: "new-website". Dəyişdirilə bilməz sonradan.'
        defaultValue={defaults?.id ?? ""}
        placeholder="new-website"
        pattern="[a-z0-9]+(-[a-z0-9]+)*"
        required
        readOnly={Boolean(defaults?.id)}
      />
      <TopicField
        name="telegramLabel"
        label="Telegram labeli (həmişə AZ)"
        hint="Telegramda görünəcək Azərbaycanca mətn."
        defaultValue={defaults?.telegramLabel ?? ""}
        placeholder="Yeni vebsayt"
        required
      />
      <TopicField
        name="az"
        label="AZ — formda göstərilən mətn"
        defaultValue={defaults?.az ?? ""}
        placeholder="Yeni vebsayt"
        required
      />
      <TopicField
        name="en"
        label="EN — formda göstərilən mətn"
        defaultValue={defaults?.en ?? ""}
        placeholder="New website"
        required
      />
      <TopicField
        name="ru"
        label="RU — formda göstərilən mətn"
        defaultValue={defaults?.ru ?? ""}
        placeholder="Новый сайт"
        required
      />
      <TopicField
        name="order"
        label="Sıra (order)"
        hint="0-dan başlayan tam ədəd. Boş buraxsanız ən sona əlavə edilir."
        defaultValue={
          defaults?.order !== undefined ? String(defaults.order) : ""
        }
        placeholder="0"
        type="number"
        min={0}
      />
    </>
  );
}

function TopicField({
  name,
  label,
  hint,
  defaultValue,
  placeholder,
  required,
  readOnly,
  pattern,
  type = "text",
  min,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  pattern?: string;
  type?: string;
  min?: number;
}) {
  return (
    <div>
      <label
        htmlFor={`field-${name}`}
        className="mb-1.5 block text-xs font-medium"
        style={{ color: "rgba(244,244,245,0.65)" }}
      >
        {label}
        {required && (
          <span aria-hidden style={{ color: "rgba(239,68,68,0.8)" }}>
            {" "}
            *
          </span>
        )}
      </label>
      <input
        id={`field-${name}`}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        readOnly={readOnly}
        pattern={pattern}
        min={min}
        className="w-full rounded-md border bg-transparent px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30"
        style={{
          borderColor: "rgba(255,255,255,0.12)",
          background: readOnly ? "rgba(255,255,255,0.03)" : "transparent",
          color: readOnly ? "rgba(244,244,245,0.4)" : "#f4f4f5",
        }}
      />
      {hint && (
        <p className="mt-1 text-xs" style={{ color: "rgba(244,244,245,0.35)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form wrapper with useActionState
// ---------------------------------------------------------------------------

type ContactTopicFormProps = {
  defaults?: Partial<ContactTopic>;
  action: (
    prevState: FormActionResult | null,
    formData: FormData,
  ) => Promise<FormActionResult>;
  submitLabel?: string;
};

export function ContactTopicForm({
  defaults,
  action,
  submitLabel = "Saxla",
}: ContactTopicFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);

  // Navigate to list on success
  useEffect(() => {
    if (state?.ok === true) {
      router.push("/admin/contact-topics");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Error banners */}
      {state?.ok === false && (
        <p
          role="alert"
          className="rounded-md p-3 text-sm"
          style={{ background: "rgba(239,68,68,0.12)", color: "#fca5a5" }}
        >
          {state.detail ?? "Zəhmət olmasa bütün sahələri düzgün doldurun."}
        </p>
      )}

      <TopicFormFields defaults={defaults} />

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md px-5 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ background: "rgba(255,255,255,0.08)", color: "#f4f4f5" }}
        >
          {isPending ? "Saxlanır..." : submitLabel}
        </button>
        <Link
          href="/admin/contact-topics"
          className="rounded-md border px-5 py-2 text-sm font-medium transition-colors"
          style={{
            borderColor: "rgba(255,255,255,0.10)",
            color: "rgba(244,244,245,0.55)",
          }}
        >
          Ləğv et
        </Link>
      </div>
    </form>
  );
}
