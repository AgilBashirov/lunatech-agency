import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/admin/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return NextResponse.redirect(new URL("/admin/login", baseUrl));
}
