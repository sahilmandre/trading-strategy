// File: backend/controllers/adminController.js

import {
  runIntradayStockUpdate,
  runDailyStockUpdate,
  runDailyPerformanceUpdate,
  runMonthlyPortfolioCreation,
} from '../jobs/schedule.js';
import User from "../models/userModel.js";
import { sendTelegramMessage } from "../services/notificationService.js";

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(`[adminController] Error in getAllUsers: ${error.message}`);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching users." });
  }
};

/**
 * @desc    Update a user's admin status
 * @route   PUT /api/admin/users/:id
 * @access  Admin
 */
export const updateUserAdminStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      // Prevent admin from removing their own admin status
      if (user._id.toString() === req.user.id) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Admin cannot remove their own admin rights.",
          });
      }
      user.isAdmin = req.body.isAdmin;
      const updatedUser = await user.save();
      res.status(200).json({
        success: true,
        data: {
          _id: updatedUser._id,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin,
        },
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error(
      `[adminController] Error in updateUserAdminStatus: ${error.message}`
    );
    res
      .status(500)
      .json({ success: false, message: "Server error while updating user." });
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.isAdmin) {
        return res
          .status(400)
          .json({ success: false, message: "Cannot delete an admin user." });
      }
      await user.deleteOne();
      res
        .status(200)
        .json({ success: true, message: "User removed successfully." });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error(`[adminController] Error in deleteUser: ${error.message}`);
    res
      .status(500)
      .json({ success: false, message: "Server error while deleting user." });
  }
};

/**
 * @desc    Broadcast a message to all linked Telegram users
 * @route   POST /api/admin/broadcast-message
 * @access  Admin
 */
export const broadcastTelegramMessage = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res
      .status(400)
      .json({ success: false, message: "Message content is required." });
  }

  try {
    const usersToNotify = await User.find({ telegramChatId: { $ne: null } });

    if (usersToNotify.length === 0) {
      return res
        .status(200)
        .json({
          success: true,
          message: "No users with linked Telegram accounts to notify.",
        });
    }

    for (const user of usersToNotify) {
      sendTelegramMessage(user.telegramChatId, message);
    }

    res
      .status(200)
      .json({
        success: true,
        message: `Broadcast sent to ${usersToNotify.length} user(s).`,
      });
  } catch (error) {
    console.error(
      `[adminController] Error in broadcastTelegramMessage: ${error.message}`
    );
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while sending broadcast.",
      });
  }
};

/**
 * @desc    Manually trigger the intraday stock update job
 * @route   POST /api/admin/run-intraday-update
 * @access  Admin
 */
export const triggerIntradayUpdate = (req, res) => {
  console.log("[ADMIN] Manual trigger for Intraday Stock Update received.");
  runIntradayStockUpdate();
  res
    .status(200)
    .json({ success: true, message: "Intraday stock update job started." });
};

/**
 * @desc    Manually trigger the daily stock analysis job
 * @route   POST /api/admin/run-daily-analysis
 * @access  Admin
 */
export const triggerDailyAnalysis = (req, res) => {
  console.log("[ADMIN] Manual trigger for Daily Stock Analysis received.");
  runDailyStockUpdate();
  res
    .status(200)
    .json({ success: true, message: "Daily stock analysis job started." });
};

/**
 * @desc    Manually trigger the daily performance update job
 * @route   POST /api/admin/run-performance-update
 * @access  Admin
 */
export const triggerPerformanceUpdate = (req, res) => {
  console.log("[ADMIN] Manual trigger for Daily Performance Update received.");
  runDailyPerformanceUpdate();
  res
    .status(200)
    .json({ success: true, message: "Daily performance update job started." });
};

/**
 * @desc    Manually trigger the monthly portfolio creation job
 * @route   POST /api/admin/run-portfolio-creation
 * @access  Admin
 */
export const triggerPortfolioCreation = (req, res) => {
  console.log(
    "[ADMIN] Manual trigger for Monthly Portfolio Creation received."
  );
  runMonthlyPortfolioCreation();
  res
    .status(200)
    .json({
      success: true,
      message: "Monthly portfolio creation job started.",
    });
};
