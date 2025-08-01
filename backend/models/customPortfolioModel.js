// File: backend/models/customPortfolioModel.js

import mongoose from 'mongoose';

// A sub-schema to store daily performance snapshots
const PerformanceEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
}, { _id: false });


const CustomPortfolioSchema = new mongoose.Schema({
  portfolioName: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // --- Performance Metrics ---
  // These will be updated frequently by a scheduled job
  totalInvested: {
    type: Number,
    default: 0,
  },
  currentValue: {
    type: Number,
    default: 0,
  },
  overallReturn: { // Stored as a raw value, e.g., 1500.50
    type: Number,
    default: 0,
  },
  overallReturnPercent: { // Stored as a percentage, e.g., 15.5
    type: Number,
    default: 0,
  },
  dayReturn: {
    type: Number,
    default: 0,
  },
  dayReturnPercent: {
    type: Number,
    default: 0,
  },
  // --- NEW FIELD FOR HISTORICAL TRACKING ---
  performanceHistory: [PerformanceEntrySchema],
}, {
  timestamps: true,
});

const CustomPortfolio = mongoose.model('CustomPortfolio', CustomPortfolioSchema);

export default CustomPortfolio;
