"use server";

import { cookies } from "next/headers";
import {
  verifyCredentials,
  signSession,
  buildSessionPayload,
  SESSION_COOKIE,
} from "@/lib/admin/auth";

export type LoginState = {
  error: string | null;
  success: boolean;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = (formData.get("username") ?? "") as string;
  const password = (formData.get("password") ?? "") as string;

  if (!username || !password) {
    return { error: "İstifadəçi adı və şifrə tələb olunur.", success: false };
  }

  const valid = await verifyCredentials(username, password);
  if (!valid) {
    return { error: "İstifadəçi adı və ya şifrə yanlışdır.", success: false };
  }

  const payload = buildSessionPayload(username);
  const token = await signSession(payload);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  });

  return { error: null, success: true };
}
