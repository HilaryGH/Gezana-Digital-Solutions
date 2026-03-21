/**
 * HomeHub Telegram Bot
 *
 * Run from server root (after `npm install` in server/):
 *   npm run telegram-bot
 *
 * Requires in server/.env:
 *   TELEGRAM_BOT_TOKEN=your_token_from_BotFather
 *   MONGO_URI=...   (optional; without it, a built-in sample list is used)
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** How many professionals to show per message (Telegram works well with small batches). */
const PAGE_SIZE = 3;

/**
 * Prefix for inline button callback_data (must stay short; Telegram limit is 64 bytes).
 * Payload format: `prof:<cursor>` — MongoDB ObjectId (24 hex) or sample offset (digits only).
 */
const CALLBACK_PREFIX = "prof:";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error(
    "[telegram-bot] Missing TELEGRAM_BOT_TOKEN in .env. Add it and restart."
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// HomeHub model (same as API / catalog agent professionals)
// ---------------------------------------------------------------------------

const AgentProfessional = require(path.join(__dirname, "..", "models", "AgentProfessional"));

/** True when `s` looks like a Mongo ObjectId (avoids confusing short strings with sample offsets). */
function isMongoObjectIdString(s) {
  return typeof s === "string" && /^[a-fA-F0-9]{24}$/.test(s);
}

/** Fallback when MONGO_URI is not set or DB is empty (demo / local testing). */
const SAMPLE_PROFESSIONALS = [
  { fullName: "Alemayehu Bekele", serviceType: "Plumbing", city: "Addis Ababa" },
  { fullName: "Sara Tesfaye", serviceType: "Deep Cleaning", city: "Bishoftu" },
  { fullName: "Daniel Haile", serviceType: "Electrical", city: "Addis Ababa" },
  { fullName: "Meron Girma", serviceType: "Babysitting", city: "Hawassa" },
  { fullName: "Yonas Mekonnen", serviceType: "HVAC", city: "Adama" },
  { fullName: "Helen Worku", serviceType: "Catering", city: "Addis Ababa" },
  { fullName: "Biniam Alemu", serviceType: "Carpentry", city: "Bahir Dar" },
];

// ---------------------------------------------------------------------------
// Data layer: cursor-based page fetch
// ---------------------------------------------------------------------------

/**
 * Fetch one page of professionals after the given cursor (exclusive).
 * @param {string|null|undefined} cursorMongoId - Previous page's last document _id (hex string), or null for first page.
 * @returns {Promise<{ items: Array<{fullName:string,serviceType:string,city:string}>, nextCursor: string|null }>}
 */
async function fetchProfessionalsPage(cursor) {
  const mongoUri = process.env.MONGO_URI;

  const useDatabase =
    mongoUri &&
    (!cursor || isMongoObjectIdString(cursor));

  if (useDatabase) {
    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(mongoUri);
      }

      // Only approved listings (aligns with typical public “professional” visibility).
      const filter = { status: "approved" };
      if (cursor) {
        filter._id = { $gt: new mongoose.Types.ObjectId(cursor) };
      }

      // Fetch PAGE_SIZE + 1 to know if another page exists.
      const docs = await AgentProfessional.find(filter)
        .sort({ _id: 1 })
        .limit(PAGE_SIZE + 1)
        .lean();

      const hasMore = docs.length > PAGE_SIZE;
      const slice = hasMore ? docs.slice(0, PAGE_SIZE) : docs;

      const items = slice.map((d) => ({
        fullName: d.fullName || "—",
        serviceType: (d.serviceType || "").trim() || "—",
        city: (d.city || d.location || "").trim() || "—",
      }));

      const nextCursor =
        hasMore && slice.length > 0
          ? String(slice[slice.length - 1]._id)
          : null;

      return { items, nextCursor };
    } catch (err) {
      console.error("[telegram-bot] DB error, falling back to sample data:", err.message);
    }
  }

  // ----- In-memory sample pagination (cursor = start index as decimal string) -----
  const start =
    cursor && /^\d+$/.test(cursor) ? parseInt(cursor, 10) : 0;
  const slice = SAMPLE_PROFESSIONALS.slice(start, start + PAGE_SIZE);
  const hasMore = start + PAGE_SIZE < SAMPLE_PROFESSIONALS.length;
  const nextCursor = hasMore ? String(start + PAGE_SIZE) : null;

  const items = slice.map((p) => ({
    fullName: p.fullName,
    serviceType: p.serviceType,
    city: p.city,
  }));

  return { items, nextCursor };
}

// ---------------------------------------------------------------------------
// Formatting messages
// ---------------------------------------------------------------------------

function formatProfessionalsList(items, pageLabel) {
  if (!items.length) {
    return "No professionals found.";
  }
  const lines = items.map((p, i) => {
    return (
      `${i + 1}. *${escapeMarkdown(p.fullName)}*\n` +
      `   Service: _${escapeMarkdown(p.serviceType)}_\n` +
      `   City: ${escapeMarkdown(p.city)}`
    );
  });
  const header = pageLabel ? `*${escapeMarkdown(pageLabel)}*\n\n` : "";
  return header + lines.join("\n\n");
}

/** Minimal escaping for Telegram MarkdownV2 (we use parse_mode below carefully). */
function escapeMarkdown(text) {
  if (!text) return "—";
  return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

// ---------------------------------------------------------------------------
// Bot setup
// ---------------------------------------------------------------------------

// Disable deprecation warning for file downloads if not used.
const bot = new TelegramBot(TOKEN, { polling: true });

console.log("[telegram-bot] Polling started. Waiting for messages…");

// ---------------------------------------------------------------------------
// Step 1: /start — welcome message
// ---------------------------------------------------------------------------
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from?.first_name || "there";

  const text =
    `Hello, ${name}! 👋\n\n` +
    `Welcome to the *HomeHub* assistant.\n\n` +
    `Commands:\n` +
    `• /professionals — browse agent\\-listed professionals \\(3 per page\\)\n` +
    `• /start — show this message`;

  bot.sendMessage(chatId, text, { parse_mode: "MarkdownV2" }).catch((err) => {
    console.error("[telegram-bot] /start send failed:", err.message);
    bot.sendMessage(
      chatId,
      "Welcome to HomeHub! Use /professionals to browse professionals."
    );
  });
});

// ---------------------------------------------------------------------------
// Step 2: /professionals — first page + optional "Next" button
// ---------------------------------------------------------------------------
bot.onText(/\/professionals/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const { items, nextCursor } = await fetchProfessionalsPage(null);
    const body = formatProfessionalsList(items, "Professionals (page 1)");

    const replyMarkup = buildNextKeyboard(nextCursor);

    await bot.sendMessage(chatId, body, {
      parse_mode: "MarkdownV2",
      reply_markup: replyMarkup,
    });
  } catch (err) {
    console.error("[telegram-bot] /professionals error:", err);
    bot.sendMessage(
      chatId,
      "Sorry, something went wrong loading professionals. Try again later."
    );
  }
});

/**
 * Build inline keyboard with at most one "Next" button when more data exists.
 * @param {string|null} nextCursor - Encoded cursor for the next request, or null when done.
 */
function buildNextKeyboard(nextCursor) {
  if (!nextCursor) {
    return { inline_keyboard: [] };
  }
  return {
    inline_keyboard: [
      [{ text: "Next ▶️", callback_data: `${CALLBACK_PREFIX}${nextCursor}` }],
    ],
  };
}

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

  if (!chatId || !messageId || !data.startsWith(CALLBACK_PREFIX)) {
    return;
  }

  const cursor = data.slice(CALLBACK_PREFIX.length);
  if (!cursor) {
    return;
  }

  try {
    const { items, nextCursor } = await fetchProfessionalsPage(cursor);

    const body =
      items.length === 0
        ? "No more professionals."
        : formatProfessionalsList(items, "Next professionals");

    const replyMarkup = buildNextKeyboard(nextCursor);

    // Edit the same message to avoid chat spam; update text and keyboard.
    await bot.editMessageText(body, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "MarkdownV2",
      reply_markup: replyMarkup,
    });
  } catch (err) {
    console.error("[telegram-bot] callback error:", err);
    try {
      await bot.sendMessage(
        chatId,
        "Could not load the next page. Please run /professionals again."
      );
    } catch (_) {}
  }
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
function shutdown(signal) {
  console.log(`[telegram-bot] ${signal} received, stopping…`);
  bot.stopPolling();
  mongoose.connection
    .close()
    .catch(() => {})
    .finally(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
