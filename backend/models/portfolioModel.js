// File: models/portfolioModel.js

import mongoose from 'mongoose';

const StockInPortfolioSchema = new mongoose.Schema(
  {
    ticker: { type: String, required: true },
    priceAtAddition: { type: Number },
    momentumScore: { type: Number },
    alpha: { type: Number },
  },
  { _id: false }
);

const PerformanceEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    portfolioReturn: { type: Number, required: true },
  },
  { _id: false }
);

const PortfolioSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    strategy: { type: String, required: true, enum: ["Momentum", "Alpha"] },
    stocks: [StockInPortfolioSchema],
    generationDate: { type: Date, default: Date.now },

    isActive: { type: Boolean, default: true },
    lastPerformanceUpdate: { type: Date },
    initialValue: { type: Number },
    currentValue: { type: Number },
    previousValue: { type: Number }, // <-- NEW: Store the previous day's value
    currentReturnPercent: { type: Number, default: 0 },
    dayReturnPercent: { type: Number, default: 0 }, // <-- NEW: Store the day's return
    peakReturnPercent: { type: Number, default: 0 },
    maxDrawdownPercent: { type: Number, default: 0 },

    performanceHistory: [PerformanceEntrySchema],
  },
  {
    timestamps: true,
  }
);

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);

export default Portfolio;
