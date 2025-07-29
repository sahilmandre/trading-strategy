// File: models/rebalanceStateModel.js

import mongoose from "mongoose";

const RebalanceStockSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    ticker: { type: String },
    weight: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    unusedCash: { type: Number, default: 0 },
  },
  { _id: false }
);

const RebalanceStateSchema = new mongoose.Schema(
  {
    // Link this state to a specific user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Creates a reference to the User model
      unique: true, // Each user can only have one rebalance state document
    },
    totalAmount: {
      type: Number,
      default: 100000,
    },
    stocks: [RebalanceStockSchema],
  },
  {
    timestamps: true,
  }
);

const RebalanceState = mongoose.model("RebalanceState", RebalanceStateSchema);

export default RebalanceState;
