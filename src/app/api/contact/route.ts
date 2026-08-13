import { NextResponse } from "next/server";
import {
  loadContactTopics,
  isValidTopicId,
  getTopicTelegramLabel,
} from "@/data/services";
import { isValidEmail, isValidPhone } from "@/lib/contactValidation";

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

// Validation lives in `@/lib/contactValidation` so this handler and the client
// form cannot drift apart. This handler stays the source of truth.

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

  // Load topics from Blob (falls back to static seed on failure).
  const topics = await loadContactTopics();

  if (!name || !phone || !serviceRaw || !isValidTopicId(serviceRaw, topics)) {
    return fail(400);
  }
  if (!isValidPhone(phone)) {
    return fail(400);
  }
  if (email && !isValidEmail(email)) {
    return fail(400);
  }

  // The "other" topic keeps the same id "other" in the seed; admin can rename
  // but by convention the special extra-message field is triggered by id "other".
  if (serviceRaw === "other" && !otherMessage) {
    return fail(400);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[contact] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set");
    return fail(500);
  }

  const telegramLabel = getTopicTelegramLabel(serviceRaw, topics);

  const lines = [
    "📩 Yeni müraciət (lunatech.az)",
    "",
    `👤 Ad: ${name}`,
    `📱 Telefon: ${phone}`,
    `📧 Email: ${email || "Qeyd edilməyib"}`,
    `🛠 Xidmət: ${telegramLabel}`,
  ];
  if (serviceRaw === "other") {
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
