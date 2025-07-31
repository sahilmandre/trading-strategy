// File: backend/services/notificationService.js

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot;

// Initialize bot only if token is available
if (token) {
  bot = new TelegramBot(token);
}

/**
 * Sends a message to a specified Telegram chat.
 * @param {string} chatId - The user's Telegram Chat ID.
 * @param {string} message - The message to send. Supports Markdown.
 */
export const sendTelegramMessage = (chatId, message) => {
  if (!bot) {
    console.warn('[Telegram Bot] Cannot send message, bot is not initialized.');
    return;
  }
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
};
