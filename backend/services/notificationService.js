// File: backend/services/notificationService.js

// This variable will hold the single, initialized bot instance.
let bot = null;

/**
 * Initializes the notification service with the bot instance.
 * This is called once when the server starts.
 * @param {TelegramBot} botInstance - The initialized TelegramBot instance.
 */
export const initNotificationService = (botInstance) => {
    bot = botInstance;
};

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
