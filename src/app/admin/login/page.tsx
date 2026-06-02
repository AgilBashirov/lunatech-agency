"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction, type LoginState } from "./actions";
import { cn } from "@/lib/cn";

const initialState: LoginState = { error: null, success: false };

export default function AdminLoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.push("/admin");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0a0a0a" }}
    >
      <div
        className="w-full max-w-sm rounded-xl border p-8"
        style={{
          background: "#111111",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(244,244,245,0.4)" }}>
            Admin Panel
          </p>
          <h1 className="text-lg font-semibold tracking-wide text-white">
            LUNATECH
          </h1>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-4" noValidate>
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-xs font-medium"
              style={{ color: "rgba(244,244,245,0.6)" }}
            >
              İstifadəçi adı
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              disabled={isPending}
              className={cn(
                "w-full rounded-md px-3 py-2.5 text-sm outline-none transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              style={{
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f4f4f5",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium"
              style={{ color: "rgba(244,244,245,0.6)" }}
            >
              Şifrə
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isPending}
              className={cn(
                "w-full rounded-md px-3 py-2.5 text-sm outline-none transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              style={{
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f4f4f5",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            />
          </div>

          {/* Error message */}
          {state.error && (
            <p
              role="alert"
              aria-live="polite"
              className="text-xs rounded-md px-3 py-2.5"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#fca5a5",
              }}
            >
              {state.error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "w-full mt-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-opacity",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "hover:opacity-90",
            )}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#f4f4f5",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {isPending ? "Yoxlanılır..." : "Daxil ol"}
          </button>
        </form>
      </div>
    </div>
  );
}
