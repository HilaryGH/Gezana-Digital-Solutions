/**
 * HomeHub Telegram Bot
 *
 * Run from server root (after `npm install` in server/):
 *   npm run telegram-bot
 *
 * Requires in server/.env:
 *   TELEGRAM_BOT_TOKEN=your_token_from_BotFather
 *   MONGO_URI=...
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const axios = require("axios");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** How many professionals to show per message (Telegram works well with small batches). */
const PAGE_SIZE = 3;

const CALLBACK_LIST_PROFESSIONALS = "lp:";
const CALLBACK_LIST_SERVICES = "ls:";
const CALLBACK_BOOK_PROFESSIONAL = "bp:";
const CALLBACK_BOOK_SERVICE = "bs:";
const BOOKING_FLOW_CANCEL = "/cancel";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error(
    "[telegram-bot] Missing TELEGRAM_BOT_TOKEN in .env. Add it and restart."
  );
  process.exit(1);
}

// Keep bot's webhook server on a separate port by default, so it doesn't
// conflict with the main API server (which also uses PORT).
const PORT = Number(process.env.TELEGRAM_BOT_PORT || process.env.PORT || 3000);
const WEBHOOK_PATH = process.env.TELEGRAM_WEBHOOK_PATH || "/webhook";
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
const WEBHOOK_BASE_URL = process.env.TELEGRAM_WEBHOOK_URL || RENDER_URL;
const WEBHOOK_URL = WEBHOOK_BASE_URL
  ? `${WEBHOOK_BASE_URL.replace(/\/+$/, "")}${WEBHOOK_PATH}`
  : "";

// IMPORTANT:
// - `RENDER_EXTERNAL_URL` typically points to *this* Render service (the bot),
//   not the main API server. Using it here can cause the bot to call its own
//   `/api/catalog` and `/api/services` endpoints (404) and show "No ... found."
// - Prefer explicitly setting TELEGRAM_DATA_API_BASE_URL to the API base.
const DATA_API_BASE_URL =
  process.env.TELEGRAM_DATA_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.SERVER_BASE_URL ||
  "http://localhost:5000";
const BOOKINGS_ENDPOINT = `${DATA_API_BASE_URL.replace(/\/+$/, "")}/api/bookings`;

if (WEBHOOK_BASE_URL && DATA_API_BASE_URL === WEBHOOK_BASE_URL) {
  console.warn(
    "[telegram-bot] DATA_API_BASE_URL equals WEBHOOK_BASE_URL. " +
      "Set TELEGRAM_DATA_API_BASE_URL to your main API base URL to avoid empty listings."
  );
}

console.log("[telegram-bot] DATA_API_BASE_URL:", DATA_API_BASE_URL);

// ---------------------------------------------------------------------------
// HomeHub model (same as API / catalog agent professionals)
// ---------------------------------------------------------------------------

const AgentProfessional = require(path.join(__dirname, "..", "models", "AgentProfessional"));
const Service = require(path.join(__dirname, "..", "models", "Service"));
require(path.join(__dirname, "..", "models", "User"));

/** In-memory booking flow state keyed by chat id. */
const pendingBookings = new Map();
/** In-memory chat language preferences keyed by chat id. Defaults to 'en'. */
const chatLanguage = new Map();

// -----------------------------------------------------------------------------
// Simple i18n for Telegram bot (English + Amharic)
// -----------------------------------------------------------------------------
const LANG = {
  en: {
    buttons: {
      book: (name) => `Book ${name}`,
      nextProfessionals: "Next professionals ▶️",
      nextServices: "Next services ▶️",
      langAm: "አማርኛ",
      langEn: "English",
    },
    common: {
      service: "Service",
      city: "City",
      category: "Category",
      type: "Type",
      price: "Price",
      provider: "Provider",
      etb: "ETB",
      noMoreProfessionals: "No more professionals.",
      noMoreServices: "No more services.",
      noProfessionalsFound: "No professionals found.",
      noServicesFound: "No active services found.",
      actionFailed: "Could not complete that action. Please try /professionals or /services again.",
      somethingWrongPros: "Sorry, something went wrong loading professionals. Try again later.",
      somethingWrongSvc: "Sorry, something went wrong loading services. Please try again in a moment.",
      cancelOk: "Booking flow canceled.",
      cancelNone: "No active booking flow.",
    },
    start: {
      welcome: (name) =>
        `Hello, ${name}! 👋\n\n` +
        `Welcome to the <b>HomeHub</b> assistant.\n\n` +
        `Commands:\n` +
        `• /professionals — browse and book agent-listed professionals\n` +
        `• /services — browse and book listed services\n` +
        `• /cancel — cancel current booking flow\n` +
        `• /start — show this message`,
      fallback: "Welcome to HomeHub! Use /professionals or /services to browse and book.",
      languagePrompt: "Choose language:",
    },
    flow: {
      begin: "Great choice. I will collect your booking details now.",
      askDate:
        "Please send your preferred booking date/time in this format:\nYYYY-MM-DD HH:mm\nExample: 2026-04-10 14:30\n\nYou can cancel anytime with /cancel.",
      askFullName: "Please send your full name.",
      askEmail: "Please send your email address.",
      askPhone: "Please send your phone number.",
      askAddress: "Please send your address/location.",
      askConfirm:
        "Please confirm your booking details:\n\nDate: {date}\nName: {name}\nEmail: {email}\nPhone: {phone}\nAddress: {address}\n\nReply with YES to submit or NO to cancel.",
      invalidDate: "Invalid date/time. Please use YYYY-MM-DD HH:mm and a future date.",
      invalidEmail: "Invalid email. Please enter a valid email.",
      invalidPhone: "Invalid phone number. Please enter a valid phone number.",
      invalidConfirm: "Please reply with YES to confirm or NO to cancel.",
      dateLost: "Date became invalid. Please restart booking.",
      missingTarget: "Missing booking target (service/professional). Please restart from /professionals or /services.",
      success: (id, status) =>
        `✅ Booking created successfully.\nBooking ID: ${id}\nStatus: ${status}\n\nHomeHub team will follow up soon.`,
      failed: "Sorry, I couldn't complete your booking. Please try again from /professionals or /services.",
    },
    pages: {
      professionals: "Professionals (page 1)",
      nextProfessionals: "Next professionals",
      services: "Services (page 1)",
      nextServices: "Next services",
    },
    commands: {
      languageSet: (langName) => `Language set to ${langName}.`,
      languagePick: "Select your language:",
    },
  },
  am: {
    buttons: {
      book: (name) => `ይሁዱ ${name}`,
      nextProfessionals: "ቀጣይ አማራጮች ▶️",
      nextServices: "ቀጣይ አገልግሎቶች ▶️",
      langAm: "አማርኛ",
      langEn: "English",
    },
    common: {
      service: "አገልግሎት",
      city: "ከተማ",
      category: "ምድብ",
      type: "ዓይነት",
      price: "ዋጋ",
      provider: "አቅራቢ",
      etb: "ብር",
      noMoreProfessionals: "የተጨማሪ ሙያ ባለሙያዎች የሉም።",
      noMoreServices: "የተጨማሪ አገልግሎቶች የሉም።",
      noProfessionalsFound: "ሙያ ባለሙያ አልተገኘም።",
      noServicesFound: "ንቁ አገልግሎት አልተገኘም።",
      actionFailed: "ተግባሩ አልተሳካም። እባክዎን /professionals ወይም /services ይሞክሩ እንደገና።",
      somethingWrongPros: "ይቅርታ፣ ሙያ ባለሙያዎችን ማስመጣት አልተሳካም። በኋላ ይሞክሩ።",
      somethingWrongSvc: "ይቅርታ፣ አገልግሎቶችን ማስመጣት አልተሳካም። በኋላ ይሞክሩ።",
      cancelOk: "የቦኪንግ ሂደት ተሰርዟል።",
      cancelNone: "ንቁ የቦኪንግ ሂደት የለም።",
    },
    start: {
      welcome: (name) =>
        `ሰላም, ${name}! 👋\n\n` +
        `<b>HomeHub</b> እንኳን ደህና መጣችሁ።\n\n` +
        `ትእዛዛት:\n` +
        `• /professionals — የኤጀንት ዝርዝር ሙያ ባለሙያዎችን ይመልከቱ እና ይያዙ\n` +
        `• /services — ዝርዝር አገልግሎቶችን ይመልከቱ እና ይያዙ\n` +
        `• /cancel — የአሁኑን የቦኪንግ ሂደት ይሰርዙ\n` +
        `• /start — ይህን መልዕክት አሳይ`,
      fallback: "ወደ HomeHub እንኳን ደህና መጣችሁ! ለመመልከት እና ለመያዝ /professionals ወይም /services ይጠቀሙ።",
      languagePrompt: "ቋንቋ ይምረጡ፦",
    },
    flow: {
      begin: "ጥሩ ምርጫ። የቦኪንግ ዝርዝሮትን አሁን እሰብስባለሁ።",
      askDate:
        "እባክዎ የሚመሩትን ቀን/ሰዓት እንዲህ በሚል መለኪያ ላኩ:\nYYYY-MM-DD HH:mm\nለምሳሌ፡ 2026-04-10 14:30\n\nበማንኛውም ጊዜ /cancel ብለው መሰረዝ ይችላሉ።",
      askFullName: "እባክዎ ሙሉ ስምዎን ይላኩ።",
      askEmail: "እባክዎ ኢሜይል አድራሻዎን ይላኩ።",
      askPhone: "እባክዎ ስልክ ቁጥርዎን ይላኩ።",
      askAddress: "እባክዎ አድራሻ/አካባቢዎን ይላኩ።",
      askConfirm:
        "እባክዎ የቦኪንግ ዝርዝሮቹን ያረጋግጡ:\n\nቀን: {date}\nስም: {name}\nኢሜይል: {email}\nስልክ: {phone}\nአድራሻ: {address}\n\nለማስገባት YES ይላኩ ወይም ለመሰረዝ NO ይላኩ።",
      invalidDate: "የቀን/ሰዓት መረጃ የተሳሳተ ነው። YYYY-MM-DD HH:mm ይጠቀሙ እና ወደፊት ቀን ይምረጡ።",
      invalidEmail: "የተሳሳተ ኢሜይል ነው። ትክክለኛ ኢሜይል ያስገቡ።",
      invalidPhone: "የተሳሳተ ስልክ ቁጥር ነው። ትክክለኛ ስልክ ቁጥር ያስገቡ።",
      invalidConfirm: "እባክዎ YES ብለው ያረጋግጡ ወይም NO ብለው ይሰርዙ።",
      dateLost: "ቀኑ ልክ አይደለም። እባክዎ ቦኪንግን ዳግም ይጀምሩ።",
      missingTarget: "የቦኪንግ ዓይነት መለያ ጠፍቷል። እባክዎ /professionals ወይም /services እንደገና ይጀምሩ።",
      success: (id, status) =>
        `✅ ቦኪንግ በተሳካ ሁኔታ ተፈጥሯል።\nየቦኪንግ መለያ: ${id}\nሁኔታ: ${status}\n\nየHomeHub ቡድን በቅርቡ ይነግርዎታል።`,
      failed: "ይቅርታ፣ ቦኪንግዎን ማጠናቀቅ አልቻልኩም። እባክዎ /professionals ወይም /services ብለው ይሞክሩ።",
    },
    pages: {
      professionals: "ሙያ ባለሙያዎች (ገፅ 1)",
      nextProfessionals: "ቀጣይ ሙያ ባለሙያዎች",
      services: "አገልግሎቶች (ገፅ 1)",
      nextServices: "ቀጣይ አገልግሎቶች",
    },
    commands: {
      languageSet: (langName) => `ቋንቋ ወደ ${langName} ተቀይሯል።`,
      languagePick: "ቋንቋ ይምረጡ:",
    },
  },
};

const CALLBACK_SET_LANGUAGE = "lang:";

function getChatLangCode(chatId) {
  return chatLanguage.get(chatId) || "en";
}

function setChatLangCode(chatId, code) {
  if (code !== "en" && code !== "am") return;
  chatLanguage.set(chatId, code);
}

function L(chatId) {
  const code = getChatLangCode(chatId);
  return LANG[code] || LANG.en;
}

/** True when `s` looks like a Mongo ObjectId (avoids confusing short strings with sample offsets). */
function isMongoObjectIdString(s) {
  return typeof s === "string" && /^[a-fA-F0-9]{24}$/.test(s);
}

async function ensureDbConnection() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Missing MONGO_URI");
  }
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongoUri);
  }
}

function parseApiOffsetCursor(cursor) {
  if (typeof cursor !== "string") return 0;
  if (!cursor.startsWith("api:")) return 0;
  const raw = Number(cursor.slice(4));
  if (!Number.isFinite(raw) || raw < 0) return 0;
  return Math.floor(raw);
}

function formatBookingId4(bookingId) {
  const bookingIdStr = String(bookingId || Date.now());
  const hash = bookingIdStr
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return String(hash % 10000).padStart(4, "0");
}

async function fetchCatalogFromApi() {
  const url = `${DATA_API_BASE_URL.replace(/\/+$/, "")}/api/catalog`;
  try {
    const response = await axios.get(url, { timeout: 15000 });
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.catalog)) return data.catalog;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch (err) {
    console.warn("[telegram-bot] fetchCatalogFromApi failed:", err?.message || err);
    return [];
  }
}

async function fetchServicesFromApi() {
  const url = `${DATA_API_BASE_URL.replace(/\/+$/, "")}/api/services`;
  try {
    const response = await axios.get(url, { timeout: 15000 });
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.services)) return data.services;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch (err) {
    console.warn("[telegram-bot] fetchServicesFromApi failed:", err?.message || err);
    return [];
  }
}

function filterCatalogAgentRows(rows) {
  return rows.filter((r) => {
    const source = String(r?.source || "").toLowerCase();
    if (source === "provider") return false;
    if (source === "agent" || source === "professional") return true;
    // Backward-compatible fallback for older /api/catalog shapes
    return (
      r?.serviceType != null ||
      r?.fullName != null ||
      r?.providerName != null ||
      r?.city != null ||
      r?.location != null
    );
  });
}

function filterCatalogProviderRows(rows) {
  return rows.filter((r) => String(r?.source || "").toLowerCase() === "provider");
}

/** Paged agent professionals from GET /api/catalog (HTTP). */
async function fetchProfessionalsPageFromCatalogApi(cursor) {
  const offset = parseApiOffsetCursor(cursor);
  const rows = await fetchCatalogFromApi();
  const professionalRows = filterCatalogAgentRows(rows);
  const slice = professionalRows.slice(offset, offset + PAGE_SIZE);
  const items = slice
    .map((d) => ({
      id: String(d?._id || d?.id || ""),
      fullName: asDisplayText(d?.providerName || d?.fullName),
      serviceType: asDisplayText(d?.serviceType || d?.title || d?.category),
      city: asDisplayText(d?.city || d?.location),
    }))
    .filter((x) => x.id);
  const nextCursor =
    offset + PAGE_SIZE < professionalRows.length ? `api:${offset + PAGE_SIZE}` : null;
  return { items, nextCursor };
}

/**
 * Paged provider services: prefer /api/catalog provider rows, else GET /api/services.
 * Respects `api:N` cursors used when Mongo is empty or unavailable.
 */
async function fetchServicesPageFromHttp(cursor) {
  const offset = parseApiOffsetCursor(cursor);
  const catalog = await fetchCatalogFromApi();
  const providerRows = filterCatalogProviderRows(catalog);
  if (providerRows.length > 0) {
    const slice = providerRows.slice(offset, offset + PAGE_SIZE);
    const items = slice
      .map((d) => ({
        id: String(d?._id || d?.id || ""),
        name: asDisplayText(d?.title || d?.name),
        category: asDisplayText(d?.category),
        type: asDisplayText(d?.type || d?.subcategory),
        price: Number(d?.price ?? 0),
        providerName: asDisplayText(d?.providerName, "Provider"),
      }))
      .filter((x) => x.id);
    const nextCursor =
      offset + PAGE_SIZE < providerRows.length ? `api:${offset + PAGE_SIZE}` : null;
    return { items, nextCursor };
  }

  const rows = await fetchServicesFromApi();
  const activeRows = rows.filter(
    (r) => r?.isActive !== false && r?.isAvailable !== false
  );
  const slice = activeRows.slice(offset, offset + PAGE_SIZE);
  const items = slice
    .map((d) => ({
      id: String(d?._id || d?.id || ""),
      name: asDisplayText(d?.name || d?.title),
      category: asDisplayText(d?.category),
      type: asDisplayText(d?.type || d?.subcategory),
      price: Number(d?.price || 0),
      providerName: asDisplayText(d?.providerName || d?.provider?.name, "Provider"),
    }))
    .filter((x) => x.id);
  const nextCursor =
    offset + PAGE_SIZE < activeRows.length ? `api:${offset + PAGE_SIZE}` : null;
  return { items, nextCursor };
}

// ---------------------------------------------------------------------------
// Data layer: cursor-based page fetch
// ---------------------------------------------------------------------------

/**
 * Fetch one page of professionals after the given cursor (exclusive).
 * @param {string|null|undefined} cursorMongoId - Previous page's last document _id (hex string), or null for first page.
 * @returns {Promise<{ items: Array<{id:string,fullName:string,serviceType:string,city:string}>, nextCursor: string|null }>}
 */
async function fetchProfessionalsPage(cursor) {
  if (cursor && typeof cursor === "string" && cursor.startsWith("api:")) {
    return fetchProfessionalsPageFromCatalogApi(cursor);
  }

  try {
    await ensureDbConnection();
    const filter = { status: "approved" };
    if (cursor && isMongoObjectIdString(cursor)) {
      filter._id = { $gt: new mongoose.Types.ObjectId(cursor) };
    }

    const docs = await AgentProfessional.find(filter)
      .sort({ _id: 1 })
      .limit(PAGE_SIZE + 1)
      .lean();

    const hasMore = docs.length > PAGE_SIZE;
    const slice = hasMore ? docs.slice(0, PAGE_SIZE) : docs;
    const items = slice.map((d) => ({
      id: String(d._id),
      fullName: asDisplayText(d.fullName),
      serviceType: asDisplayText(d.serviceType),
      city: asDisplayText(d.city || d.location),
    }));
    const nextCursor =
      hasMore && slice.length > 0 ? String(slice[slice.length - 1]._id) : null;

    if (items.length > 0) {
      return { items, nextCursor };
    }

    // Mongo returned no rows (e.g. bot DB empty / wrong URI, or no approved pros) — load from main API.
    if (!cursor) {
      return fetchProfessionalsPageFromCatalogApi(null);
    }
    return { items: [], nextCursor: null };
  } catch (dbErr) {
    console.warn("[telegram-bot] DB fetchProfessionalsPage failed, using API fallback:", dbErr?.message || dbErr);
    if (!cursor || (typeof cursor === "string" && cursor.startsWith("api:"))) {
      return fetchProfessionalsPageFromCatalogApi(cursor);
    }
    return { items: [], nextCursor: null };
  }
}

async function fetchServicesPage(cursor) {
  if (cursor && typeof cursor === "string" && cursor.startsWith("api:")) {
    return fetchServicesPageFromHttp(cursor);
  }

  try {
    await ensureDbConnection();
    const filter = { isActive: true };
    if (cursor && isMongoObjectIdString(cursor)) {
      filter._id = { $gt: new mongoose.Types.ObjectId(cursor) };
    }

    let docs = [];
    try {
      docs = await Service.find(filter)
        .sort({ _id: 1 })
        .populate("provider", "name")
        .limit(PAGE_SIZE + 1)
        .lean();
    } catch (err) {
      // Keep /services usable even if populate fails on legacy/invalid provider refs.
      console.warn("[telegram-bot] Service populate failed, using fallback:", err.message);
      docs = await Service.find(filter)
        .sort({ _id: 1 })
        .limit(PAGE_SIZE + 1)
        .lean();
    }

    const hasMore = docs.length > PAGE_SIZE;
    const slice = hasMore ? docs.slice(0, PAGE_SIZE) : docs;
    const items = slice.map((d) => ({
      id: String(d._id),
      name: asDisplayText(d.name),
      category: asDisplayText(d.category),
      type: asDisplayText(d.type),
      price: Number(d.price || 0),
      providerName: asDisplayText(d.provider?.name, "Provider"),
    }));
    const nextCursor =
      hasMore && slice.length > 0 ? String(slice[slice.length - 1]._id) : null;

    if (items.length > 0) {
      return { items, nextCursor };
    }

    if (!cursor) {
      return fetchServicesPageFromHttp(null);
    }
    return { items: [], nextCursor: null };
  } catch (dbErr) {
    console.warn("[telegram-bot] DB fetchServicesPage failed, using API fallback:", dbErr?.message || dbErr);
    if (!cursor || (typeof cursor === "string" && cursor.startsWith("api:"))) {
      return fetchServicesPageFromHttp(cursor);
    }
    return { items: [], nextCursor: null };
  }
}

// ---------------------------------------------------------------------------
// Formatting messages
// ---------------------------------------------------------------------------
// Use HTML for dynamic DB text. MarkdownV2 breaks easily on ".", "-", "(", etc.
// in names and service strings — Telegram returns 400 Bad Request.

function escapeHtml(text) {
  if (text == null || text === "") return "—";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Convert potentially malformed DB values into safe display strings. */
function asDisplayText(value, fallback = "—") {
  if (value == null) return fallback;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    if (typeof value.name === "string" && value.name.trim()) return value.name.trim();
    if (typeof value.title === "string" && value.title.trim()) return value.title.trim();
    if (typeof value.label === "string" && value.label.trim()) return value.label.trim();
    return fallback;
  }
  return fallback;
}

function formatProfessionalsListHtml(items, pageLabel) {
  if (!items.length) {
    return "No professionals found.";
  }
  const lines = items.map((p, i) => {
    return (
      `${i + 1}. <b>${escapeHtml(p.fullName)}</b>\n` +
      `   Service: ${escapeHtml(p.serviceType)}\n` +
      `   City: ${escapeHtml(p.city)}`
    );
  });
  const header = pageLabel ? `<b>${escapeHtml(pageLabel)}</b>\n\n` : "";
  return header + lines.join("\n\n");
}

function formatServicesListHtml(items, pageLabel) {
  if (!items.length) return "No active services found.";
  const lines = items.map((s, i) => {
    return (
      `${i + 1}. <b>${escapeHtml(s.name)}</b>\n` +
      `   Category: ${escapeHtml(s.category)} / ${escapeHtml(s.type)}\n` +
      `   Price: ${escapeHtml(s.price)} ETB\n` +
      `   Provider: ${escapeHtml(s.providerName)}`
    );
  });
  const header = pageLabel ? `<b>${escapeHtml(pageLabel)}</b>\n\n` : "";
  return header + lines.join("\n\n");
}

/** Send professional list; falls back to plain text if Telegram still rejects. */
async function sendProfessionalsMessage(chatId, body, replyMarkup) {
  const opts = { parse_mode: "HTML", reply_markup: replyMarkup };
  try {
    await bot.sendMessage(chatId, body, opts);
  } catch (err) {
    console.error("[telegram-bot] sendMessage HTML failed:", err.message);
    const strip = body.replace(/<\/?b>/gi, "").replace(/<\/?i>/gi, "");
    await bot.sendMessage(chatId, strip, { reply_markup: replyMarkup });
  }
}

// Reuse the same behavior; naming is just clearer for /services flows.
async function sendServicesMessage(chatId, body, replyMarkup) {
  return sendProfessionalsMessage(chatId, body, replyMarkup);
}

async function editProfessionalsMessage(chatId, messageId, body, replyMarkup) {
  const opts = {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: "HTML",
    reply_markup: replyMarkup,
  };
  try {
    await bot.editMessageText(body, opts);
  } catch (err) {
    console.error("[telegram-bot] editMessageText HTML failed:", err.message);
    const strip = body.replace(/<\/?b>/gi, "");
    await bot.editMessageText(strip, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: replyMarkup,
    });
  }
}

// Reuse the same behavior; naming is just clearer for /services flows.
async function editServicesMessage(chatId, messageId, body, replyMarkup) {
  return editProfessionalsMessage(chatId, messageId, body, replyMarkup);
}

function buildProfessionalsKeyboard(items, nextCursor) {
  // Note: label text is filled at send time based on chat language
  const rows = items.map((p) => [
    { text: p.fullName.slice(0, 20), callback_data: `${CALLBACK_BOOK_PROFESSIONAL}${p.id}` },
  ]);
  if (nextCursor) {
    rows.push([{ text: nextCursor, callback_data: `${CALLBACK_LIST_PROFESSIONALS}${nextCursor}` }]);
  }
  return { inline_keyboard: rows };
}

function buildServicesKeyboard(items, nextCursor) {
  const rows = items.map((s) => [
    { text: s.name.slice(0, 20), callback_data: `${CALLBACK_BOOK_SERVICE}${s.id}` },
  ]);
  if (nextCursor) {
    rows.push([{ text: nextCursor, callback_data: `${CALLBACK_LIST_SERVICES}${nextCursor}` }]);
  }
  return { inline_keyboard: rows };
}

function parseBookingDateInput(raw) {
  const input = String(raw || "").trim();
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, y, m, d, hh, mm] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), 0, 0);
  // Reject impossible values like 2026-02-31 25:61
  if (
    date.getFullYear() !== Number(y) ||
    date.getMonth() !== Number(m) - 1 ||
    date.getDate() !== Number(d) ||
    date.getHours() !== Number(hh) ||
    date.getMinutes() !== Number(mm)
  ) {
    return null;
  }
  if (date.getTime() < Date.now()) return null;
  return date;
}

function isValidPhoneNumber(input) {
  const raw = String(input || "").trim();
  if (!/^\+?[0-9()\-\s]{7,20}$/.test(raw)) return false;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 7;
}

function formatBookingDateForDisplay(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue || "");
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildBookingPayload(flow, chatId) {
  if (!flow?.date || !flow?.name || !flow?.email || !flow?.phone || !flow?.address) {
    throw new Error("Missing required booking fields in flow state.");
  }
  if (!flow.professionalId && !flow.serviceId) {
    throw new Error("Missing service or professional id in flow state.");
  }

  return {
    ...(flow.professionalId ? { agentProfessional: flow.professionalId } : {}),
    ...(flow.serviceId ? { service: flow.serviceId } : {}),
    date: new Date(flow.date).toISOString(),
    paymentMethod: "cash",
    note: `Telegram booking. chatId=${chatId}, username=${flow.username || "unknown"}`,
    guestInfo: {
      fullName: flow.name,
      email: flow.email,
      phone: flow.phone,
      address: flow.address,
    },
  };
}

function extractApiErrorMessage(error) {
  const apiData = error?.response?.data;
  if (typeof apiData?.message === "string" && apiData.message.trim()) return apiData.message;
  if (typeof apiData?.error === "string" && apiData.error.trim()) return apiData.error;
  if (typeof error?.message === "string" && error.message.trim()) return error.message;
  return "Unknown booking error";
}

async function submitBookingThroughApi(flow, chatId) {
  const bookingData = buildBookingPayload(flow, chatId);
  console.log("BOOKING DATA:", bookingData);
  const response = await axios.post(BOOKINGS_ENDPOINT, bookingData, { timeout: 15000 });
  return response?.data;
}

function startBookingFlow(chatId, flow) {
  pendingBookings.set(chatId, {
    step: "date",
    professionalId: flow.professionalId || null,
    serviceId: flow.serviceId || null,
    date: null,
    name: "",
    email: "",
    phone: "",
    address: "",
    username: flow.username || "",
  });
}

function clearBookingFlow(chatId) {
  pendingBookings.delete(chatId);
}

async function promptForCurrentStep(chatId, step) {
  const ln = L(chatId);
  if (step === "date") {
    await bot.sendMessage(chatId, ln.flow.askDate);
    return;
  }
  if (step === "fullName") {
    await bot.sendMessage(chatId, ln.flow.askFullName);
    return;
  }
  if (step === "email") {
    await bot.sendMessage(chatId, ln.flow.askEmail);
    return;
  }
  if (step === "phone") {
    await bot.sendMessage(chatId, ln.flow.askPhone);
    return;
  }
  if (step === "address") {
    await bot.sendMessage(chatId, ln.flow.askAddress);
    return;
  }
  if (step === "confirm") {
    const flow = pendingBookings.get(chatId);
    if (!flow) return;
    const text = ln.flow.askConfirm
      .replace("{date}", escapeHtml(formatBookingDateForDisplay(flow.date)))
      .replace("{name}", escapeHtml(flow.name))
      .replace("{email}", escapeHtml(flow.email))
      .replace("{phone}", escapeHtml(flow.phone))
      .replace("{address}", escapeHtml(flow.address));
    await bot.sendMessage(chatId, text, { parse_mode: "HTML" });
  }
}

// ---------------------------------------------------------------------------
// Bot setup
// ---------------------------------------------------------------------------

const bot = new TelegramBot(TOKEN);
const app = express();
app.use(express.json({ limit: "1mb" }));

// ---------------------------------------------------------------------------
// Step 1: /start — welcome message
// ---------------------------------------------------------------------------
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const name = escapeHtml(msg.from?.first_name || "there");

  const ln = L(chatId);
  const text = ln.start.welcome(name);

  // Language switch inline buttons
  const langKeyboard = {
    inline_keyboard: [
      [
        { text: `🇺🇸 ${ln.buttons.langEn}`, callback_data: `${CALLBACK_SET_LANGUAGE}en` },
        { text: `🇪🇹 ${ln.buttons.langAm}`, callback_data: `${CALLBACK_SET_LANGUAGE}am` },
      ],
    ],
  };

  bot.sendMessage(chatId, text, {
    parse_mode: "HTML",
    reply_markup: {
      keyboard: [[{ text: "/professionals" }, { text: "/services" }]],
      resize_keyboard: true,
      inline_keyboard: langKeyboard.inline_keyboard,
    },
  }).catch((err) => {
    console.error("[telegram-bot] /start send failed:", err.message);
    bot.sendMessage(
      chatId,
      L(chatId).start.fallback
    );
  });
});

bot.onText(/\/cancel/, async (msg) => {
  const chatId = msg.chat.id;
  if (pendingBookings.has(chatId)) {
    clearBookingFlow(chatId);
    await bot.sendMessage(chatId, L(chatId).common.cancelOk);
  } else {
    await bot.sendMessage(chatId, L(chatId).common.cancelNone);
  }
});

// Language command to explicitly open language selector
bot.onText(/\/language/, async (msg) => {
  const chatId = msg.chat.id;
  const ln = L(chatId);
  await bot.sendMessage(chatId, ln.commands.languagePick, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: `🇺🇸 ${ln.buttons.langEn}`, callback_data: `${CALLBACK_SET_LANGUAGE}en` },
          { text: `🇪🇹 ${ln.buttons.langAm}`, callback_data: `${CALLBACK_SET_LANGUAGE}am` },
        ],
      ],
    },
  });
});

// ---------------------------------------------------------------------------
// Step 2: /professionals — first page + optional "Next" button
// ---------------------------------------------------------------------------
bot.onText(/\/professionals/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const { items, nextCursor } = await fetchProfessionalsPage(null);
    const ln = L(chatId);
    const localized = {
      items: items.map((d) => ({
        ...d,
        fullName: d.fullName,
        serviceType: d.serviceType,
        city: d.city,
      })),
    };
    // Localize labels inside the list body
    const body = (function () {
      if (!localized.items.length) return ln.common.noProfessionalsFound;
      const lines = localized.items.map((p, i) => {
        return (
          `${i + 1}. <b>${escapeHtml(p.fullName)}</b>\n` +
          `   ${ln.common.service}: ${escapeHtml(p.serviceType)}\n` +
          `   ${ln.common.city}: ${escapeHtml(p.city)}`
        );
      });
      const header = ln.pages.professionals ? `<b>${escapeHtml(ln.pages.professionals)}</b>\n\n` : "";
      return header + lines.join("\n\n");
    })();
    // Build keyboard and then localize button labels
    const kb = buildProfessionalsKeyboard(items, nextCursor);
    kb.inline_keyboard = kb.inline_keyboard.map((row) => {
      const [btn] = row;
      if (btn?.callback_data?.startsWith(CALLBACK_BOOK_PROFESSIONAL)) {
        const id = btn.callback_data.slice(CALLBACK_BOOK_PROFESSIONAL.length);
        const item = items.find((x) => x.id === id);
        return [{ text: ln.buttons.book((item?.fullName || "").slice(0, 20)), callback_data: btn.callback_data }];
      }
      if (btn?.callback_data?.startsWith(CALLBACK_LIST_PROFESSIONALS)) {
        return [{ text: ln.buttons.nextProfessionals, callback_data: btn.callback_data }];
      }
      return row;
    });
    const replyMarkup = kb;
    await sendProfessionalsMessage(chatId, body, replyMarkup);
  } catch (err) {
    console.error(
      "[telegram-bot] /professionals error:",
      err?.stack || err?.message || err,
      err?.response?.body || ""
    );
    try {
      await bot.sendMessage(
        chatId,
        L(chatId).common.somethingWrongPros
      );
    } catch (_) {}
  }
});

bot.onText(/\/services/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const { items, nextCursor } = await fetchServicesPage(null);
    const ln = L(chatId);
    const body = (function () {
      if (!items.length) return ln.common.noServicesFound;
      const lines = items.map((s, i) => {
        return (
          `${i + 1}. <b>${escapeHtml(s.name)}</b>\n` +
          `   ${ln.common.category}: ${escapeHtml(s.category)} / ${escapeHtml(s.type)}\n` +
          `   ${ln.common.price}: ${escapeHtml(s.price)} ${ln.common.etb}\n` +
          `   ${ln.common.provider}: ${escapeHtml(s.providerName)}`
        );
      });
      const header = ln.pages.services ? `<b>${escapeHtml(ln.pages.services)}</b>\n\n` : "";
      return header + lines.join("\n\n");
    })();
    const kb = buildServicesKeyboard(items, nextCursor);
    kb.inline_keyboard = kb.inline_keyboard.map((row) => {
      const [btn] = row;
      if (btn?.callback_data?.startsWith(CALLBACK_BOOK_SERVICE)) {
        const id = btn.callback_data.slice(CALLBACK_BOOK_SERVICE.length);
        const item = items.find((x) => x.id === id);
        return [{ text: ln.buttons.book((item?.name || "").slice(0, 20)), callback_data: btn.callback_data }];
      }
      if (btn?.callback_data?.startsWith(CALLBACK_LIST_SERVICES)) {
        return [{ text: ln.buttons.nextServices, callback_data: btn.callback_data }];
      }
      return row;
    });
    const replyMarkup = kb;
    await sendServicesMessage(chatId, body, replyMarkup);
  } catch (err) {
    console.error(
      "[telegram-bot] /services error:",
      err?.stack || err?.message || err,
      err?.response?.body || ""
    );
    try {
      await bot.sendMessage(
        chatId,
        L(chatId).common.somethingWrongSvc
      );
    } catch (_) {}
  }
});

// ---------------------------------------------------------------------------
// Step 3: Button clicks — load next batch using cursor from callback_data
// ---------------------------------------------------------------------------
bot.on("callback_query", async (query) => {
  const chatId = query.message?.chat?.id;
  const messageId = query.message?.message_id;
  const data = query.data || "";

  // Acknowledge quickly so Telegram stops the loading spinner on the user's client.
  try {
    await bot.answerCallbackQuery(query.id);
  } catch (_) {
    /* ignore duplicate/expired ack */
  }

  if (!chatId || !messageId || !data) {
    return;
  }

  try {
    if (data.startsWith(CALLBACK_SET_LANGUAGE)) {
      const code = data.slice(CALLBACK_SET_LANGUAGE.length);
      setChatLangCode(chatId, code);
      const ln = L(chatId);
      const name = code === "am" ? ln.buttons.langAm : ln.buttons.langEn;
      await bot.sendMessage(chatId, ln.commands.languageSet(name));
      return;
    }

    if (data.startsWith(CALLBACK_LIST_PROFESSIONALS)) {
      const cursor = data.slice(CALLBACK_LIST_PROFESSIONALS.length);
      const { items, nextCursor } = await fetchProfessionalsPage(cursor);
      const ln = L(chatId);
      const body =
        items.length === 0
          ? ln.common.noMoreProfessionals
          : (function () {
              const lines = items.map((p, i) => {
                return (
                  `${i + 1}. <b>${escapeHtml(p.fullName)}</b>\n` +
                  `   ${ln.common.service}: ${escapeHtml(p.serviceType)}\n` +
                  `   ${ln.common.city}: ${escapeHtml(p.city)}`
                );
              });
              const header = ln.pages.nextProfessionals ? `<b>${escapeHtml(ln.pages.nextProfessionals)}</b>\n\n` : "";
              return header + lines.join("\n\n");
            })();
      const kb = buildProfessionalsKeyboard(items, nextCursor);
      kb.inline_keyboard = kb.inline_keyboard.map((row) => {
        const [btn] = row;
        if (btn?.callback_data?.startsWith(CALLBACK_BOOK_PROFESSIONAL)) {
          const id = btn.callback_data.slice(CALLBACK_BOOK_PROFESSIONAL.length);
          const item = items.find((x) => x.id === id);
          return [{ text: ln.buttons.book((item?.fullName || "").slice(0, 20)), callback_data: btn.callback_data }];
        }
        if (btn?.callback_data?.startsWith(CALLBACK_LIST_PROFESSIONALS)) {
          return [{ text: ln.buttons.nextProfessionals, callback_data: btn.callback_data }];
        }
        return row;
      });
      const replyMarkup = kb;
      await editProfessionalsMessage(chatId, messageId, body, replyMarkup);
      return;
    }

    if (data.startsWith(CALLBACK_LIST_SERVICES)) {
      const cursor = data.slice(CALLBACK_LIST_SERVICES.length);
      const { items, nextCursor } = await fetchServicesPage(cursor);
      const ln = L(chatId);
      const body =
        items.length === 0
          ? ln.common.noMoreServices
          : (function () {
              const lines = items.map((s, i) => {
                return (
                  `${i + 1}. <b>${escapeHtml(s.name)}</b>\n` +
                  `   ${ln.common.category}: ${escapeHtml(s.category)} / ${escapeHtml(s.type)}\n` +
                  `   ${ln.common.price}: ${escapeHtml(s.price)} ${ln.common.etb}\n` +
                  `   ${ln.common.provider}: ${escapeHtml(s.providerName)}`
                );
              });
              const header = ln.pages.nextServices ? `<b>${escapeHtml(ln.pages.nextServices)}</b>\n\n` : "";
              return header + lines.join("\n\n");
            })();
      const kb = buildServicesKeyboard(items, nextCursor);
      kb.inline_keyboard = kb.inline_keyboard.map((row) => {
        const [btn] = row;
        if (btn?.callback_data?.startsWith(CALLBACK_BOOK_SERVICE)) {
          const id = btn.callback_data.slice(CALLBACK_BOOK_SERVICE.length);
          const item = items.find((x) => x.id === id);
          return [{ text: ln.buttons.book((item?.name || "").slice(0, 20)), callback_data: btn.callback_data }];
        }
        if (btn?.callback_data?.startsWith(CALLBACK_LIST_SERVICES)) {
          return [{ text: ln.buttons.nextServices, callback_data: btn.callback_data }];
        }
        return row;
      });
      const replyMarkup = kb;
      await editServicesMessage(chatId, messageId, body, replyMarkup);
      return;
    }

    if (data.startsWith(CALLBACK_BOOK_PROFESSIONAL)) {
      const professionalId = data.slice(CALLBACK_BOOK_PROFESSIONAL.length);
      await bot.sendMessage(
        chatId,
        L(chatId).flow.begin
      );
      startBookingFlow(chatId, {
        professionalId,
        username: query.from?.username || query.from?.first_name || "",
      });
      await promptForCurrentStep(chatId, "date");
      return;
    }

    if (data.startsWith(CALLBACK_BOOK_SERVICE)) {
      const serviceId = data.slice(CALLBACK_BOOK_SERVICE.length);
      await bot.sendMessage(
        chatId,
        L(chatId).flow.begin
      );
      startBookingFlow(chatId, {
        serviceId,
        username: query.from?.username || query.from?.first_name || "",
      });
      await promptForCurrentStep(chatId, "date");
      return;
    }
  } catch (err) {
    console.error("[telegram-bot] callback error:", err.message, err.response?.body || "");
    try {
      await bot.sendMessage(
        chatId,
        L(chatId).common.actionFailed
      );
    } catch (_) {}
  }
});

bot.on("message", async (msg) => {
  const chatId = msg.chat?.id;
  const text = String(msg.text || "").trim();
  if (!chatId || !text) return;
  if (text.startsWith("/")) return;

  const flow = pendingBookings.get(chatId);
  if (!flow) return;

  try {
    if (flow.step === "date") {
      const date = parseBookingDateInput(text);
      if (!date) {
        await bot.sendMessage(
          chatId,
          L(chatId).flow.invalidDate
        );
        return;
      }
      flow.date = date.toISOString();
      flow.step = "fullName";
      pendingBookings.set(chatId, flow);
      await promptForCurrentStep(chatId, "fullName");
      return;
    }

    if (flow.step === "fullName") {
      if (!text.trim()) {
        await bot.sendMessage(chatId, L(chatId).flow.askFullName);
        return;
      }
      flow.name = text.trim();
      flow.step = "email";
      pendingBookings.set(chatId, flow);
      await promptForCurrentStep(chatId, "email");
      return;
    }

    if (flow.step === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
        await bot.sendMessage(chatId, L(chatId).flow.invalidEmail);
        return;
      }
      flow.email = text.trim();
      flow.step = "phone";
      pendingBookings.set(chatId, flow);
      await promptForCurrentStep(chatId, "phone");
      return;
    }

    if (flow.step === "phone") {
      if (!isValidPhoneNumber(text)) {
        await bot.sendMessage(chatId, L(chatId).flow.invalidPhone);
        return;
      }
      flow.phone = text.trim();
      flow.step = "address";
      pendingBookings.set(chatId, flow);
      await promptForCurrentStep(chatId, "address");
      return;
    }

    if (flow.step === "address") {
      if (!text.trim()) {
        await bot.sendMessage(chatId, L(chatId).flow.askAddress);
        return;
      }
      flow.address = text.trim();
      flow.step = "confirm";
      pendingBookings.set(chatId, flow);
      await promptForCurrentStep(chatId, "confirm");
      return;
    }

    if (flow.step === "confirm") {
      const normalized = text.toLowerCase();
      const confirmYes = normalized === "yes" || normalized === "y";
      const confirmNo = normalized === "no" || normalized === "n";

      if (!confirmYes && !confirmNo) {
        await bot.sendMessage(chatId, L(chatId).flow.invalidConfirm);
        return;
      }

      if (confirmNo) {
        clearBookingFlow(chatId);
        await bot.sendMessage(chatId, L(chatId).common.cancelOk);
        return;
      }

      if (!flow.serviceId && !flow.professionalId) {
        clearBookingFlow(chatId);
        await bot.sendMessage(chatId, L(chatId).flow.missingTarget);
        return;
      }

      const parsedDate = new Date(flow.date);
      if (Number.isNaN(parsedDate.getTime()) || parsedDate.getTime() < Date.now()) {
        clearBookingFlow(chatId);
        await bot.sendMessage(chatId, L(chatId).flow.dateLost);
        return;
      }

      try {
        const booking = await submitBookingThroughApi(flow, chatId);
        clearBookingFlow(chatId);
        const shortBookingId = formatBookingId4(booking?._id || booking?.id);
        await bot.sendMessage(chatId, L(chatId).flow.success(shortBookingId, booking.status));
      } catch (apiError) {
        console.error("BOOKING ERROR:", apiError?.response?.data || apiError?.message || apiError);
        const reason = extractApiErrorMessage(apiError);
        clearBookingFlow(chatId);
        await bot.sendMessage(chatId, `${L(chatId).flow.failed}\nReason: ${reason}`);
      }
    }
  } catch (err) {
    console.error("[telegram-bot] booking flow error:", err.message);
    clearBookingFlow(chatId);
    await bot.sendMessage(
      chatId,
      L(chatId).flow.failed
    );
  }
});

// ---------------------------------------------------------------------------
// Webhook server
// ---------------------------------------------------------------------------

app.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "homehub-telegram-bot",
    mode: "webhook",
    webhookPath: WEBHOOK_PATH,
  });
});

app.post(WEBHOOK_PATH, async (req, res) => {
  try {
    await bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error("[telegram-bot] processUpdate failed:", err?.message || err);
    res.sendStatus(500);
  }
});

app.use((err, _req, res, _next) => {
  console.error("[telegram-bot] express error:", err?.message || err);
  res.status(500).json({ ok: false, message: "Internal server error" });
});

async function initWebhook() {
  if (!WEBHOOK_URL) {
    console.error(
      "[telegram-bot] Missing TELEGRAM_WEBHOOK_URL or RENDER_EXTERNAL_URL. Cannot set webhook."
    );
    // If webhook URL isn't configured (common in local dev), continue running.
    // node-telegram-bot-api typically uses polling by default, but we explicitly start it
    // to keep the bot functional.
    try {
      if (typeof bot.startPolling === "function") {
        await bot.startPolling();
        console.log("[telegram-bot] Started polling (webhook URL missing).");
      }
    } catch (err) {
      console.warn("[telegram-bot] Polling start failed:", err?.message || err);
    }
    return;
  }

  try {
    await bot.deleteWebHook();
    const ok = await bot.setWebHook(WEBHOOK_URL);
    console.log("[telegram-bot] setWebHook result:", ok);
    console.log("[telegram-bot] Webhook URL:", WEBHOOK_URL);
  } catch (err) {
    console.error("[telegram-bot] Failed to set webhook:", err?.message || err);
    process.exit(1);
  }
}

app.listen(PORT, async () => {
  console.log(`[telegram-bot] Web service listening on port ${PORT}`);
  await initWebhook();
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
function shutdown(signal) {
  console.log(`[telegram-bot] ${signal} received, stopping…`);
  bot.deleteWebHook().catch(() => {});
  mongoose.connection
    .close()
    .catch(() => {})
    .finally(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
