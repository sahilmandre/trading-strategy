// File: backend/controllers/userController.js

import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Function to generate a JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        email: user.email,
        token: generateToken(user._id),
        telegramChatId: user.telegramChatId,
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(`[userController] Error in registerUser: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/users/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        email: user.email,
        token: generateToken(user._id),
        telegramChatId: user.telegramChatId,
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(`[userController] Error in loginUser: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

/**
 * @desc    Generate a token for linking a Telegram account
 * @route   POST /api/users/telegram-token
 * @access  Private
 */
export const generateTelegramLinkToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 6; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    user.telegramLinkToken = token;
    await user.save();

    res.status(200).json({
      success: true,
      token: token,
    });
  } catch (error) {
    console.error(`[userController] Error in generateTelegramLinkToken: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error while generating token' });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json({
        _id: user._id,
        email: user.email,
        telegramChatId: user.telegramChatId,
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error(`[userController] Error in getUserProfile: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Disconnect a user's Telegram account
 * @route   POST /api/users/telegram-disconnect
 * @access  Private
 */
export const disconnectTelegram = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.telegramChatId = undefined;
    await user.save();
    res.status(200).json({ success: true, message: 'Telegram account disconnected.' });
  } catch (error) {
    console.error(`[userController] Error in disconnectTelegram: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error while disconnecting.' });
  }
};
