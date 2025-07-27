// File: models/rebalanceStateModel.js

import mongoose from 'mongoose';

// This sub-schema defines the structure for each stock row in the rebalance table.
const RebalanceStockSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  ticker: { type: String },
  weight: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
}, { _id: false });

// This schema will store the entire state of the rebalance tool.
// We will only have one document in this collection to represent the user's single table.
const RebalanceStateSchema = new mongoose.Schema({
  // A unique identifier to ensure we only ever have one document.
  singletonId: {
    type: String,
    default: 'global',
    unique: true,
  },
  totalAmount: {
    type: Number,
    default: 100000,
  },
  stocks: [RebalanceStockSchema],
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const RebalanceState = mongoose.model('RebalanceState', RebalanceStateSchema);

export default RebalanceState;
