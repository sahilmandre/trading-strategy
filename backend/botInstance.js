// File: backend/botInstance.js

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;

if (token) {
  bot = new TelegramBot(token, { polling: true });
  console.log('🤖 Telegram Bot instance created.');
} else {
  console.warn('[Telegram Bot] Warning: TELEGRAM_BOT_TOKEN is not set. Bot features will be disabled.');
}

export default bot;
