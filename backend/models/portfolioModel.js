// File: models/portfolioModel.js

import mongoose from 'mongoose';

// This sub-schema defines the structure for each stock within a portfolio.
const StockInPortfolioSchema = new mongoose.Schema(
  {
    ticker: {
      type: String,
      required: true,
    },
    priceAtAddition: {
      type: Number,
    },
    // Store the relevant score for the strategy that created the portfolio.
    // These are optional because a momentum stock won't have an alpha score here, and vice-versa.
    momentumScore: {
      type: Number,
    },
    alpha: {
      type: Number,
    },
  },
  { _id: false }
); // _id: false prevents Mongoose from creating an id for these subdocuments

const PortfolioSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Portfolio name is required."],
      unique: true,
    },
    strategy: {
      type: String,
      required: [true, "Strategy type is required."],
      enum: ["Momentum", "Alpha"],
    },
    stocks: [StockInPortfolioSchema],
    generationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);

export default Portfolio;
