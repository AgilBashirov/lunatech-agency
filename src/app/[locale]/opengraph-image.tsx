import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const alt = "Lunatech";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Image({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#05060a",
          backgroundImage:
            "radial-gradient(circle at 82% 22%, rgba(34,211,238,0.35), transparent 55%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -1,
            color: "#ffffff",
          }}
        >
          Lunatech
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 32,
            lineHeight: 1.4,
            maxWidth: 880,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          {t("description")}
        </div>
      </div>
    ),
    { ...size },
  );
}
