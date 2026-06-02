import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { SESSION_COOKIE, verifySession } from "./lib/admin/auth";

/** `false` — brauzer dilinə görə avtomatik `/en` və s. yox; əsas dil həmişə `defaultLocale` (`az`). */
const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: false,
});

function redirectToLogin(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Admin routes — next-intl-dən kənar tutulur
  if (pathname.startsWith("/admin")) {
    // Login səhifəsi açıqdır
    if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
      return NextResponse.next();
    }

    // Digər admin yolları üçün session yoxlanır
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return redirectToLogin(request);

    try {
      const session = await verifySession(token);
      if (!session) return redirectToLogin(request);
    } catch {
      // ADMIN_SESSION_SECRET yoxdursa və ya başqa runtime xəta — login-ə yönləndir
      return redirectToLogin(request);
    }

    return NextResponse.next();
  }

  // Bütün digər yollar → intl middleware
  return intlMiddleware(request) as NextResponse;
}

export const config = {
  matcher: [
    // Admin yolları — intl-dən müstəqil handle olunur
    "/admin/:path*",
    // Digər bütün yollar (api, _next, _vercel, statik fayllar istisna)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
