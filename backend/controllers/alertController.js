// File: backend/controllers/alertController.js

import Alert from '../models/alertModel.js';
import User from '../models/userModel.js';
import StockData from '../models/stockDataModel.js';

/**
 * Creates a new price alert for a user.
 * This can be called from the web UI or internally by the Telegram bot.
 */
export const createAlert = async (req, res) => {
  const { ticker, targetPrice, condition } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user || !user.telegramChatId) {
      return res.status(400).json({ success: false, message: 'Telegram account is not linked.' });
    }

    const stockExists = await StockData.findOne({ ticker: ticker.toUpperCase() });
    if (!stockExists) {
        return res.status(404).json({ success: false, message: `Stock with ticker ${ticker} not found.` });
    }

    const alert = await Alert.create({
      user: userId,
      telegramChatId: user.telegramChatId,
      ticker: ticker.toUpperCase(),
      targetPrice,
      condition,
    });

    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    console.error(`[alertController] Error in createAlert: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error while creating alert.' });
  }
};

/**
 * Gets all active alerts for the logged-in user.
 */
export const getActiveAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user.id, isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    console.error(`[alertController] Error in getActiveAlerts: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error while fetching alerts.' });
  }
};

/**
 * Deletes a specific alert.
 */
export const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    // Ensure the user owns the alert they are trying to delete
    if (alert.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized.' });
    }

    await alert.deleteOne();

    res.status(200).json({ success: true, message: 'Alert removed.' });
  } catch (error) {
    console.error(`[alertController] Error in deleteAlert: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error while deleting alert.' });
  }
};
