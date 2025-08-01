// File: backend/models/tradeModel.js

import mongoose from 'mongoose';

const TradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  portfolio: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'CustomPortfolio',
  },
  ticker: {
    type: String,
    required: true,
    uppercase: true,
  },
  tradeType: {
    type: String,
    required: true,
    enum: ['buy', 'sell'],
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: { // Price per share at the time of the trade
    type: Number,
    required: true,
  },
  tradeDate: {
    type: Date,
    required: true,
  },
  // --- Fields for Tracking P&L ---
  status: {
    type: String,
    required: true,
    enum: ['open', 'closed'],
    default: 'open',
  },
  // For 'sell' trades, this links back to the opening 'buy' trade
  closingTradeFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade',
  },
  // --- Performance Metrics (for open trades) ---
  currentValue: {
    type: Number,
  },
  unrealizedPnL: {
    type: Number,
  },
  unrealizedPnLPercent: {
    type: Number,
  },
  // --- Performance Metrics (for closed trades) ---
  realizedPnL: {
    type: Number,
  },
}, {
  timestamps: true,
});

const Trade = mongoose.model('Trade', TradeSchema);

export default Trade;
