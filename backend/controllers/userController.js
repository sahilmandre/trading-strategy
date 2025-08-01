// File: backend/controllers/userController.js

import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

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
      // --- SET ADMIN FLAG ON REGISTRATION ---
      isAdmin: email === 'sahilmandre@gmail.com',
    });
    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin, // Include isAdmin in response
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin, // Include isAdmin in response
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ... (generateTelegramLinkToken, getUserProfile, disconnectTelegram functions remain unchanged)
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
    res.status(500).json({ success: false, message: 'Server error while generating token' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json({
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        telegramChatId: user.telegramChatId,
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

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
    res.status(500).json({ success: false, message: 'Server error while disconnecting.' });
  }
};
