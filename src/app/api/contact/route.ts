import { NextResponse } from "next/server";
import {
  getServiceTelegramLabel,
  isServiceId,
  type ServiceId,
} from "@/data/services";

export const runtime = "nodejs";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  service?: unknown;
  otherMessage?: unknown;
  message?: unknown;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function fail(status: number) {
  return NextResponse.json({ success: false }, { status });
}

export async function POST(req: Request) {
  let payload: ContactPayload;
  try {
    payload = (await req.json()) as ContactPayload;
  } catch {
    return fail(400);
  }

  const name = asString(payload.name);
  const email = asString(payload.email);
  const phone = asString(payload.phone);
  const serviceRaw = asString(payload.service);
  const otherMessage = asString(payload.otherMessage);
  const message = asString(payload.message);

  if (!name || !phone || !serviceRaw || !isServiceId(serviceRaw)) {
    return fail(400);
  }
  const service: ServiceId = serviceRaw;
  if (service === "other" && !otherMessage) {
    return fail(400);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[contact] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set");
    return fail(500);
  }

  const lines = [
    "📩 Yeni müraciət (lunatech.az)",
    "",
    `👤 Ad: ${name}`,
    `📱 Telefon: ${phone}`,
    `📧 Email: ${email || "Qeyd edilməyib"}`,
    `🛠 Xidmət: ${getServiceTelegramLabel(service)}`,
  ];
  if (service === "other") {
    lines.push(`📌 Əlavə: ${otherMessage}`);
  }
  lines.push("", "📝 Mesaj:", message || "Yoxdur");

  try {
    const tg = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: lines.join("\n"),
          disable_web_page_preview: true,
        }),
        cache: "no-store",
      },
    );

    if (!tg.ok) {
      const detail = await tg.text().catch(() => "");
      console.error("[contact] telegram responded", tg.status, detail);
      return fail(502);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] telegram request failed", err);
    return fail(502);
  }
}
