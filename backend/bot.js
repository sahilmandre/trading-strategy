// File: backend/bot.js

import User from './models/userModel.js';
import Alert from './models/alertModel.js';
import StockData from './models/stockDataModel.js';

// In-memory store for multi-step command conversations
const userStates = {};

/**
 * Sets up all command listeners for the Telegram bot.
 * @param {TelegramBot} bot - The single, initialized TelegramBot instance.
 */
const setupBotCommands = (bot) => {
    if (!bot) {
        console.warn('[Telegram Bot] Cannot set up commands, bot is not initialized.');
    return;
  }

  // --- Command: /start ---
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const response = `👋 Welcome to the StockScreener Alert Bot!\n\nYour unique Chat ID is: \`${chatId}\`\n\nTo link this Telegram account to your profile on the website, please get a temporary link token from the website's **Settings** page and send the command here in the format: \`/link YOUR_TOKEN\``;
    bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
  });

  // --- Command: /link <token> ---
  bot.onText(/\/link (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const providedToken = match[1];

    try {
      const user = await User.findOne({ telegramLinkToken: providedToken });
      if (!user) {
        bot.sendMessage(chatId, "❌ **Link Failed:** This token is invalid or has expired. Please generate a new one from the website's settings page.");
        return;
      }
      user.telegramChatId = chatId;
      user.telegramLinkToken = undefined;
      await user.save();
      bot.sendMessage(chatId, `✅ **Success!**\nYour Telegram account is now linked to your StockScreener account (${user.email}). You can now manage alerts directly from this chat.`);
    } catch (error) {
      console.error('[Telegram Bot] Error processing /link command:', error);
      bot.sendMessage(chatId, 'An unexpected error occurred while trying to link your account.');
    }
  });

    // ... (all other commands: /add_alert, /my_alerts, /delete_alert, etc. remain the same) ...
  // --- Command: /add_alert ---
  bot.onText(/\/add_alert/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramChatId: chatId });
    if (!user) {
      bot.sendMessage(chatId, "Your Telegram account is not linked. Please use `/link YOUR_TOKEN` first.");
      return;
    }
    userStates[chatId] = { command: 'add_alert', step: 'awaiting_ticker' };
    bot.sendMessage(chatId, "What is the stock ticker you want to track? (e.g., RELIANCE.NS)");
  });

  // --- Command: /my_alerts ---
  bot.onText(/\/my_alerts/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramChatId: chatId });
    if (!user) {
      bot.sendMessage(chatId, "Your Telegram account is not linked.");
      return;
    }
    const alerts = await Alert.find({ user: user._id, isActive: true }).sort({ createdAt: 1 });
    if (alerts.length === 0) {
      bot.sendMessage(chatId, "You have no active alerts. Use `/add_alert` to create one.");
      return;
    }
    let response = "Your Active Alerts:\n\n";
    alerts.forEach((alert, index) => {
      const condition = alert.condition === 'above' ? '>' : '<';
      response += `${index + 1}. \`${alert.ticker}\` ${condition} ₹${alert.targetPrice}\n`;
    });
    response += "\nTo delete an alert, use the command `/delete_alert <number>`."
    bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
  });

  // --- Command: /delete_alert <number> ---
  bot.onText(/\/delete_alert (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const alertNumber = parseInt(match[1], 10);

    const user = await User.findOne({ telegramChatId: chatId });
    if (!user) {
      bot.sendMessage(chatId, "Your Telegram account is not linked.");
      return;
    }

    if (isNaN(alertNumber) || alertNumber <= 0) {
      bot.sendMessage(chatId, "Please provide a valid alert number. Use `/my_alerts` to see the list.");
      return;
    }

    const alerts = await Alert.find({ user: user._id, isActive: true }).sort({ createdAt: 1 });
    if (alertNumber > alerts.length) {
      bot.sendMessage(chatId, "Invalid alert number. Use `/my_alerts` to see the correct numbers.");
      return;
    }

    const alertToDelete = alerts[alertNumber - 1];
    await alertToDelete.deleteOne();
    bot.sendMessage(chatId, `✅ **Alert Deleted:** The alert for \`${alertToDelete.ticker}\` has been removed.`, { parse_mode: 'Markdown' });
  });

  // --- Handler for conversational messages ---
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const state = userStates[chatId];

    if (msg.text.startsWith('/')) return;

    if (state && state.command === 'add_alert') {
      switch (state.step) {
        case 'awaiting_ticker':
          const ticker = msg.text.toUpperCase();
          const stockExists = await StockData.findOne({ ticker });
          if (!stockExists) {
            bot.sendMessage(chatId, "❌ Invalid ticker. Please provide a valid NSE ticker (e.g., TCS.NS).");
            return;
          }
          const currentPrice = stockExists.currentPrice;
          state.ticker = ticker;
          state.step = 'awaiting_price';
          bot.sendMessage(chatId, `Got it. The current price for ${ticker} is ₹${currentPrice.toFixed(2)}.\n\nWhat is your target price?`);
          break;

        case 'awaiting_price':
          const price = parseFloat(msg.text);
          if (isNaN(price) || price <= 0) {
            bot.sendMessage(chatId, "❌ Invalid price. Please enter a positive number.");
            return;
          }
          state.price = price;
          state.step = 'awaiting_condition';
          bot.sendMessage(chatId, `Should I alert you when the price goes **above** or **below** ${price}?`, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '📈 Above', callback_data: 'above' }, { text: '📉 Below', callback_data: 'below' }]
              ]
            }
          });
          break;
      }
    }
  });

  // --- Handler for inline keyboard button presses ---
  bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const condition = callbackQuery.data;
    const state = userStates[chatId];

    if (state && state.command === 'add_alert' && state.step === 'awaiting_condition') {
      const user = await User.findOne({ telegramChatId: chatId });
      if (!user) {
        bot.sendMessage(chatId, "Error: Could not find your linked account.");
        delete userStates[chatId];
        return;
      }

      await Alert.create({
        user: user._id,
        telegramChatId: chatId,
        ticker: state.ticker,
        targetPrice: state.price,
        condition: condition,
      });

      bot.editMessageText(`✅ **Alert Set:** I will notify you when \`${state.ticker}\` goes ${condition} ₹${state.price}.`, {
        chat_id: chatId,
        message_id: msg.message_id,
        parse_mode: 'Markdown'
      });
      
        delete userStates[chatId];
    }
  });

    console.log('🤖 Telegram Bot commands are set up and listening...');
};

export default setupBotCommands;
