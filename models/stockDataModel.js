// File: models/stockDataModel.js

import mongoose from 'mongoose';

const StockDataSchema = new mongoose.Schema(
  {
    ticker: {
      type: String,
      required: [true, "Stock ticker is required."],
      unique: true, // Each ticker will have only one entry in this collection
      uppercase: true,
    },
    longName: {
      type: String, // Store the company's full name
    },
    lastRefreshed: {
      type: Date,
      default: Date.now,
    },
    currentPrice: {
      type: Number,
    },
    volume: {
      type: Number,
    },
    momentumScore: {
      type: Number,
      default: 0,
    },
    // --- NEW FIELD ---
    // This will store the calculated alpha value.
    alpha: {
      type: Number,
      default: 0,
    },
    // Storing individual performance metrics for potential future use
    perf1D: { type: Number },
    perf1W: { type: Number },
    perf1M: { type: Number },
    perf3M: { type: Number },
    perf6M: { type: Number },
    perf1Y: { type: Number },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create an index on momentumScore to speed up sorting queries.
StockDataSchema.index({ momentumScore: -1 });

// --- NEW INDEX ---
// Create an index on alpha to speed up sorting queries for the alpha screener.
StockDataSchema.index({ alpha: -1 });

const StockData = mongoose.model('StockData', StockDataSchema);

export default StockData;
