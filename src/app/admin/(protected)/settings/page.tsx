/**
 * Admin — Sayt parametrləri (social media linklər).
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin/session";
import { getSettings, setSettings } from "@/lib/admin/contentStore";
import type { SiteSettings } from "@/lib/admin/types";

type Props = { searchParams: Promise<{ saved?: string }> };

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

async function saveSettings(formData: FormData): Promise<void> {
  "use server";

  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const get = (k: string) => (formData.get(k) as string | null)?.trim() ?? "";

  const data: SiteSettings = {
    social: {
      x: get("social.x"),
      linkedin: get("social.linkedin"),
      dribbble: get("social.dribbble"),
      instagram: get("social.instagram"),
      facebook: get("social.facebook"),
      youtube: get("social.youtube"),
      github: get("social.github"),
    },
  };

  await setSettings(data);
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

const inputClass =
  "w-full rounded-md border bg-transparent px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30";
const inputStyle = { borderColor: "rgba(255,255,255,0.12)" } as const;
const labelStyle = { color: "rgba(244,244,245,0.65)" } as const;
const hintStyle = { color: "rgba(244,244,245,0.35)" } as const;

// ---------------------------------------------------------------------------
// Social platforms config
// ---------------------------------------------------------------------------

const SOCIAL_FIELDS = [
  { key: "x",        label: "X (Twitter)",  placeholder: "https://x.com/lunatech" },
  { key: "linkedin", label: "LinkedIn",      placeholder: "https://linkedin.com/company/lunatech" },
  { key: "dribbble", label: "Dribbble",      placeholder: "https://dribbble.com/lunatech" },
  { key: "instagram",label: "Instagram",     placeholder: "https://instagram.com/lunatech" },
  { key: "facebook", label: "Facebook",      placeholder: "https://facebook.com/lunatech" },
  { key: "youtube",  label: "YouTube",       placeholder: "https://youtube.com/@lunatech" },
  { key: "github",   label: "GitHub",        placeholder: "https://github.com/lunatech" },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SettingsPage({ searchParams }: Props) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [settings, { saved }] = await Promise.all([getSettings(), searchParams]);

  return (
    <div className="p-6 md:p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white mb-1">Parametrlər</h1>
        <p className="text-sm" style={{ color: "rgba(244,244,245,0.5)" }}>
          Footer-dəki social media linklərini idarə edin. Boş saxlasanız ikon gizlənir.
        </p>
      </div>

      {saved === "1" && (
        <p className="mb-4 rounded-md p-3 text-sm" style={{ background: "rgba(34,197,94,0.10)", color: "#86efac" }}>
          Parametrlər uğurla saxlandı.
        </p>
      )}

      <form action={saveSettings} className="flex flex-col gap-6">
        <div
          className="rounded-xl border p-5 flex flex-col gap-4"
          style={{ borderColor: "rgba(255,255,255,0.08)", background: "#1a1a1a" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(244,244,245,0.4)" }}>
            Social Media
          </p>

          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label
                htmlFor={`field-${key}`}
                className="mb-1.5 block text-xs font-medium"
                style={labelStyle}
              >
                {label}
              </label>
              <input
                id={`field-${key}`}
                name={`social.${key}`}
                type="url"
                defaultValue={settings.social[key]}
                placeholder={placeholder}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          ))}

          <p className="text-xs" style={hintStyle}>
            URL boş buraxılsa həmin platforma footer-dən gizlənir.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md px-5 py-2 text-sm font-medium transition-opacity"
            style={{ background: "rgba(255,255,255,0.08)", color: "#f4f4f5" }}
          >
            Saxla
          </button>
        </div>
      </form>
    </div>
  );
}
