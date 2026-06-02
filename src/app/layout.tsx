import type { Viewport } from "next";
import { Geist_Mono, Inter, Manrope } from "next/font/google";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";
import Script from "next/script";
import { PreventZoom } from "@/components/layout/PreventZoom";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#05060a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

type Props = { children: ReactNode };

export default async function RootLayout({ children }: Props) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <PreventZoom />
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-777029437"
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-777029437');
          `}
        </Script>
      </body>
    </html>
  );
}
