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

const PORT = Number(process.env.PORT || 3000);
const WEBHOOK_PATH = process.env.TELEGRAM_WEBHOOK_PATH || "/webhook";
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
const WEBHOOK_BASE_URL = process.env.TELEGRAM_WEBHOOK_URL || RENDER_URL;
const WEBHOOK_URL = WEBHOOK_BASE_URL
  ? `${WEBHOOK_BASE_URL.replace(/\/+$/, "")}${WEBHOOK_PATH}`
  : "";

// ---------------------------------------------------------------------------
// HomeHub model (same as API / catalog agent professionals)
// ---------------------------------------------------------------------------

const AgentProfessional = require(path.join(__dirname, "..", "models", "AgentProfessional"));
const Service = require(path.join(__dirname, "..", "models", "Service"));
const Booking = require(path.join(__dirname, "..", "models", "Booking"));
const Category = require(path.join(__dirname, "..", "models", "Category"));
const ServiceType = require(path.join(__dirname, "..", "models", "ServiceType"));
require(path.join(__dirname, "..", "models", "User"));

/** In-memory booking flow state keyed by chat id. */
const pendingBookings = new Map();

/** True when `s` looks like a Mongo ObjectId (avoids confusing short strings with sample offsets). */
function isMongoObjectIdString(s) {
  return typeof s === "string" && /^[a-fA-F0-9]{24}$/.test(s);
}

async function ensureDbConnection() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Missing MONGO_URI. Telegram bot requires database access.");
  }
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongoUri);
  }
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
    fullName: d.fullName || "—",
    serviceType: (d.serviceType || "").trim() || "—",
    city: (d.city || d.location || "").trim() || "—",
  }));
  const nextCursor =
    hasMore && slice.length > 0 ? String(slice[slice.length - 1]._id) : null;
  return { items, nextCursor };
}

async function fetchServicesPage(cursor) {
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
    name: d.name || "—",
    category: d.category || "—",
    type: d.type || "—",
    price: Number(d.price || 0),
    providerName: d.provider?.name || "Provider",
  }));
  const nextCursor =
    hasMore && slice.length > 0 ? String(slice[slice.length - 1]._id) : null;
  return { items, nextCursor };
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

function buildProfessionalsKeyboard(items, nextCursor) {
  const rows = items.map((p) => [
    { text: `Book ${p.fullName.slice(0, 20)}`, callback_data: `${CALLBACK_BOOK_PROFESSIONAL}${p.id}` },
  ]);
  if (nextCursor) {
    rows.push([{ text: "Next professionals ▶️", callback_data: `${CALLBACK_LIST_PROFESSIONALS}${nextCursor}` }]);
  }
  return { inline_keyboard: rows };
}

function buildServicesKeyboard(items, nextCursor) {
  const rows = items.map((s) => [
    { text: `Book ${s.name.slice(0, 20)}`, callback_data: `${CALLBACK_BOOK_SERVICE}${s.id}` },
  ]);
  if (nextCursor) {
    rows.push([{ text: "Next services ▶️", callback_data: `${CALLBACK_LIST_SERVICES}${nextCursor}` }]);
  }
  return { inline_keyboard: rows };
}

async function getOrCreateCategoryAndServiceType(categoryName, serviceTypeName) {
  let categoryDoc = await Category.findOne({ name: categoryName });
  if (!categoryDoc) {
    categoryDoc = await Category.create({ name: categoryName });
  }
  let serviceTypeDoc = await ServiceType.findOne({
    name: serviceTypeName,
    category: categoryDoc._id,
  });
  if (!serviceTypeDoc) {
    serviceTypeDoc = await ServiceType.create({
      name: serviceTypeName,
      category: categoryDoc._id,
    });
  }
  return { categoryDoc, serviceTypeDoc };
}

function parseBookingDateInput(raw) {
  const input = String(raw || "").trim();
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getTime() < Date.now()) return null;
  return date;
}

function normalizeBookingInput(flow, chatId) {
  const c = flow.collected || {};
  return {
    date: parseBookingDateInput(c.dateText),
    guestInfo: {
      fullName: c.fullName || "Telegram User",
      email: c.email || `telegram+${chatId}@homehub.local`,
      phone: c.phone || "N/A",
      address: c.address || "N/A",
    },
    noteSuffix: `chatId=${chatId}, username=${flow.username || "unknown"}`,
  };
}

async function createProfessionalBookingFromTelegram(professionalId, bookingInput) {
  await ensureDbConnection();
  const professional = await AgentProfessional.findById(professionalId).lean();
  if (!professional || professional.status !== "approved") {
    throw new Error("Professional is not available for booking.");
  }

  const { categoryDoc, serviceTypeDoc } = await getOrCreateCategoryAndServiceType(
    "Agent-listed professionals",
    (professional.serviceType || "Professional services").trim()
  );

  const eventDate = bookingInput.date;
  const note = `Telegram booking (professional). ${bookingInput.noteSuffix}`;

  const booking = await Booking.create({
    bookingKind: "professional",
    category: categoryDoc._id,
    serviceType: serviceTypeDoc._id,
    agentProfessional: professional._id,
    agent: professional.agent || undefined,
    professionalPrice: Number(process.env.AGENT_PROFESSIONAL_DEFAULT_BOOKING_PRICE || 500),
    date: eventDate,
    note,
    paymentStatus: "pending",
    paymentMethod: "cash",
    guestInfo: bookingInput.guestInfo,
  });
  return booking;
}

async function createServiceBookingFromTelegram(serviceId, bookingInput) {
  await ensureDbConnection();
  const service = await Service.findById(serviceId).lean();
  if (!service || service.isActive === false) {
    throw new Error("Service is not available for booking.");
  }

  const { categoryDoc, serviceTypeDoc } = await getOrCreateCategoryAndServiceType(
    service.category || "General",
    service.type || "Standard"
  );

  const eventDate = bookingInput.date;
  const note = `Telegram booking (service). ${bookingInput.noteSuffix}`;

  const booking = await Booking.create({
    bookingKind: "service",
    category: categoryDoc._id,
    serviceType: serviceTypeDoc._id,
    service: service._id,
    date: eventDate,
    note,
    paymentStatus: "pending",
    paymentMethod: "cash",
    guestInfo: bookingInput.guestInfo,
  });
  return booking;
}

function startBookingFlow(chatId, flow) {
  pendingBookings.set(chatId, {
    ...flow,
    step: "date",
    collected: {},
  });
}

function clearBookingFlow(chatId) {
  pendingBookings.delete(chatId);
}

async function promptForCurrentStep(chatId, step) {
  if (step === "date") {
    await bot.sendMessage(
      chatId,
      "Please send your preferred booking date/time in this format:\nYYYY-MM-DD HH:mm\nExample: 2026-04-10 14:30\n\nYou can cancel anytime with /cancel."
    );
    return;
  }
  if (step === "fullName") {
    await bot.sendMessage(chatId, "Please send your full name.");
    return;
  }
  if (step === "email") {
    await bot.sendMessage(chatId, "Please send your email address.");
    return;
  }
  if (step === "phone") {
    await bot.sendMessage(chatId, "Please send your phone number.");
    return;
  }
  if (step === "address") {
    await bot.sendMessage(chatId, "Please send your address/location.");
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

  const text =
    `Hello, ${name}! 👋\n\n` +
    `Welcome to the <b>HomeHub</b> assistant.\n\n` +
    `Commands:\n` +
    `• /professionals — browse and book agent-listed professionals\n` +
    `• /services — browse and book listed services\n` +
    `• /cancel — cancel current booking flow\n` +
    `• /start — show this message`;

  bot.sendMessage(chatId, text, { parse_mode: "HTML" }).catch((err) => {
    console.error("[telegram-bot] /start send failed:", err.message);
    bot.sendMessage(
      chatId,
      "Welcome to HomeHub! Use /professionals or /services to browse and book."
    );
  });
});

bot.onText(/\/cancel/, async (msg) => {
  const chatId = msg.chat.id;
  if (pendingBookings.has(chatId)) {
    clearBookingFlow(chatId);
    await bot.sendMessage(chatId, "Booking flow canceled.");
  } else {
    await bot.sendMessage(chatId, "No active booking flow.");
  }
});

// ---------------------------------------------------------------------------
// Step 2: /professionals — first page + optional "Next" button
// ---------------------------------------------------------------------------
bot.onText(/\/professionals/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const { items, nextCursor } = await fetchProfessionalsPage(null);
    const body = formatProfessionalsListHtml(items, "Professionals (page 1)");
    const replyMarkup = buildProfessionalsKeyboard(items, nextCursor);
    await sendProfessionalsMessage(chatId, body, replyMarkup);
  } catch (err) {
    console.error("[telegram-bot] /professionals error:", err.message, err.response?.body || "");
    try {
      await bot.sendMessage(
        chatId,
        "Sorry, something went wrong loading professionals. Try again later."
      );
    } catch (_) {}
  }
});

bot.onText(/\/services/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const { items, nextCursor } = await fetchServicesPage(null);
    const body = formatServicesListHtml(items, "Services (page 1)");
    const replyMarkup = buildServicesKeyboard(items, nextCursor);
    await sendProfessionalsMessage(chatId, body, replyMarkup);
  } catch (err) {
    console.error("[telegram-bot] /services error:", err.message, err.stack || "");
    try {
      await bot.sendMessage(
        chatId,
        "Sorry, something went wrong loading services. Please try again in a moment."
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
    if (data.startsWith(CALLBACK_LIST_PROFESSIONALS)) {
      const cursor = data.slice(CALLBACK_LIST_PROFESSIONALS.length);
      const { items, nextCursor } = await fetchProfessionalsPage(cursor);
      const body =
        items.length === 0
          ? "No more professionals."
          : formatProfessionalsListHtml(items, "Next professionals");
      const replyMarkup = buildProfessionalsKeyboard(items, nextCursor);
      await editProfessionalsMessage(chatId, messageId, body, replyMarkup);
      return;
    }

    if (data.startsWith(CALLBACK_LIST_SERVICES)) {
      const cursor = data.slice(CALLBACK_LIST_SERVICES.length);
      const { items, nextCursor } = await fetchServicesPage(cursor);
      const body =
        items.length === 0
          ? "No more services."
          : formatServicesListHtml(items, "Next services");
      const replyMarkup = buildServicesKeyboard(items, nextCursor);
      await editProfessionalsMessage(chatId, messageId, body, replyMarkup);
      return;
    }

    if (data.startsWith(CALLBACK_BOOK_PROFESSIONAL)) {
      const professionalId = data.slice(CALLBACK_BOOK_PROFESSIONAL.length);
      await bot.sendMessage(
        chatId,
        "Great choice. I will collect your booking details now."
      );
      startBookingFlow(chatId, {
        type: "professional",
        targetId: professionalId,
        username: query.from?.username || query.from?.first_name || "",
      });
      await promptForCurrentStep(chatId, "date");
      return;
    }

    if (data.startsWith(CALLBACK_BOOK_SERVICE)) {
      const serviceId = data.slice(CALLBACK_BOOK_SERVICE.length);
      await bot.sendMessage(
        chatId,
        "Great choice. I will collect your booking details now."
      );
      startBookingFlow(chatId, {
        type: "service",
        targetId: serviceId,
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
        "Could not complete that action. Please try /professionals or /services again."
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
          "Invalid date/time. Please use YYYY-MM-DD HH:mm and a future date."
        );
        return;
      }
      flow.collected.dateText = text;
      flow.step = "fullName";
      pendingBookings.set(chatId, flow);
      await promptForCurrentStep(chatId, "fullName");
      return;
    }

    if (flow.step === "fullName") {
      flow.collected.fullName = text;
      flow.step = "email";
      pendingBookings.set(chatId, flow);
      await promptForCurrentStep(chatId, "email");
      return;
    }

    if (flow.step === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
        await bot.sendMessage(chatId, "Invalid email. Please enter a valid email.");
        return;
      }
      flow.collected.email = text;
      flow.step = "phone";
      pendingBookings.set(chatId, flow);
      await promptForCurrentStep(chatId, "phone");
      return;
    }

    if (flow.step === "phone") {
      flow.collected.phone = text;
      flow.step = "address";
      pendingBookings.set(chatId, flow);
      await promptForCurrentStep(chatId, "address");
      return;
    }

    if (flow.step === "address") {
      flow.collected.address = text;
      const bookingInput = normalizeBookingInput(flow, chatId);
      if (!bookingInput.date) {
        await bot.sendMessage(chatId, "Date became invalid. Please restart booking.");
        clearBookingFlow(chatId);
        return;
      }

      const booking =
        flow.type === "professional"
          ? await createProfessionalBookingFromTelegram(flow.targetId, bookingInput)
          : await createServiceBookingFromTelegram(flow.targetId, bookingInput);

      clearBookingFlow(chatId);
      await bot.sendMessage(
        chatId,
        `✅ Booking created successfully.\nBooking ID: ${booking._id}\nStatus: ${booking.status}\n\nHomeHub team will follow up soon.`
      );
    }
  } catch (err) {
    console.error("[telegram-bot] booking flow error:", err.message);
    clearBookingFlow(chatId);
    await bot.sendMessage(
      chatId,
      "Sorry, I couldn't complete your booking. Please try again from /professionals or /services."
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
    process.exit(1);
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
