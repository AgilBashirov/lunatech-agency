import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/** `false` — brauzer dilinə görə avtomatik `/en` və s. yox; əsas dil həmişə `defaultLocale` (`az`). */
const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: false,
});

export function proxy(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
