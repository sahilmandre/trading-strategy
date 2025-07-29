// File: models/stockDataModel.js

import mongoose from "mongoose";

const StockDataSchema = new mongoose.Schema(
  {
    // Core Info
    ticker: { type: String, required: true, unique: true, uppercase: true },
    longName: { type: String },
    lastRefreshed: { type: Date, default: Date.now },
    currentPrice: { type: Number },
    volume: { type: Number },
    marketCap: { type: Number }, // Performance Metrics

    perf1D: { type: Number },
    perf1W: { type: Number },
    perf1M: { type: Number },
    perf3M: { type: Number },
    perf6M: { type: Number },
    perf1Y: { type: Number }, // Technicals for Minervini Strategy

    fiftyDayAverage: { type: Number },
    hundredFiftyDayAverage: { type: Number },
    twoHundredDayAverage: { type: Number },
    fiftyTwoWeekLow: { type: Number },
    fiftyTwoWeekHigh: { type: Number },
    avgVolume50Day: { type: Number },
    avgVolume200Day: { type: Number }, // Fundamentals for CANSLIM Strategy (Simplified)

    epsTrailingTwelveMonths: { type: Number },
    trailingPE: { type: Number }, // Calculated Strategy Fields

    alpha: { type: Number, default: 0 },
    // --- DEFINITIVE FIX: Add the missing momentumScore field ---
    momentumScore: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Create indexes for fields we will sort by frequently
StockDataSchema.index({ alpha: -1 });
StockDataSchema.index({ momentumScore: -1 }); // Add index for sorting

const StockData = mongoose.model("StockData", StockDataSchema);

export default StockData;
