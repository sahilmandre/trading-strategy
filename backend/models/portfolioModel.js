// File: models/portfolioModel.js

import mongoose from 'mongoose';

// This sub-schema defines the structure for each stock within a portfolio.
const StockInPortfolioSchema = new mongoose.Schema(
  {
    ticker: { type: String, required: true },
    priceAtAddition: { type: Number },
    momentumScore: { type: Number },
    alpha: { type: Number },
  },
  { _id: false }
);

const PortfolioSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    strategy: { type: String, required: true, enum: ["Momentum", "Alpha"] },
    stocks: [StockInPortfolioSchema],
    generationDate: { type: Date, default: Date.now },

    // --- NEW PERFORMANCE TRACKING FIELDS ---
    isActive: {
      type: Boolean,
      default: true, // A portfolio is active for the month it was generated in.
    },
    lastPerformanceUpdate: {
      type: Date,
    },
    initialValue: {
      type: Number, // The total value of the portfolio at creation
    },
    currentValue: {
      type: Number, // The current total value of the portfolio
    },
    currentReturnPercent: {
      type: Number,
      default: 0,
    },
    peakReturnPercent: {
      type: Number,
      default: 0, // The highest return percentage this portfolio has ever reached
    },
    maxDrawdownPercent: {
      type: Number,
      default: 0, // The largest drop from a peak, stored as a negative number
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);

export default Portfolio;
