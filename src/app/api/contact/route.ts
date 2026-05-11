import { NextResponse } from "next/server";
import {
  getServiceTelegramLabel,
  isServiceId,
  type ServiceId,
} from "@/data/services";

export const runtime = "nodejs";

// Per-field length caps. Keep the composite Telegram message well under the
// 4096-char API limit even if every field is filled to the max.
const MAX = {
  name: 100,
  phone: 40,
  email: 120,
  otherMessage: 500,
  message: 2000,
} as const;

// Soft regexes — strict enough to reject typos, loose enough for international
// phones and uncommon TLDs. The form mirrors them client-side; server is the
// source of truth.
const PHONE_RE = /^[+\d][\d\s\-()]{8,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  service?: unknown;
  otherMessage?: unknown;
  message?: unknown;
  hp?: unknown;
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

  // Honeypot — real users never see this field; spam bots fill every input.
  // Return success to keep the bot away from retrying without actually
  // notifying the recipient.
  const hp = asString(payload.hp);
  if (hp) {
    console.warn("[contact] honeypot triggered, dropping submission");
    return NextResponse.json({ success: true });
  }

  const name = asString(payload.name);
  const email = asString(payload.email);
  const phone = asString(payload.phone);
  const serviceRaw = asString(payload.service);
  const otherMessage = asString(payload.otherMessage);
  const message = asString(payload.message);

  if (
    name.length > MAX.name ||
    phone.length > MAX.phone ||
    email.length > MAX.email ||
    otherMessage.length > MAX.otherMessage ||
    message.length > MAX.message
  ) {
    return fail(400);
  }

  if (!name || !phone || !serviceRaw || !isServiceId(serviceRaw)) {
    return fail(400);
  }
  if (!PHONE_RE.test(phone)) {
    return fail(400);
  }
  if (email && !EMAIL_RE.test(email)) {
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
