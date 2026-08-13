import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Google Ads/gtag.js (see `src/app/layout.tsx`) needs an inline bootstrap
// script and talks to several google.com/doubleclick.net subdomains for
// conversion pings — script-src/connect-src stay permissive for those
// specific hosts rather than adopting a nonce-based CSP, which would force
// every route (including the currently-static service/blog pages) into
// dynamic rendering.
//
// `blob:` in connect-src/worker-src is required by three.js's GLTFLoader,
// which resolves the moon model's embedded texture through a blob: URL —
// without it the hero 3D model silently fails to texture.
const isDev = process.env.NODE_ENV !== "production";
const googleAdsHosts =
  "https://www.googletagmanager.com https://www.google.com https://www.gstatic.com https://www.googleadservices.com https://*.doubleclick.net";
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' ${googleAdsHosts}${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${googleAdsHosts}`,
  "font-src 'self' data:",
  `connect-src 'self' blob: https://www.google-analytics.com https://analytics.google.com ${googleAdsHosts}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspDirectives },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
