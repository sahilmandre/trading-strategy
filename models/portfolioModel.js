// File: models/portfolioModel.js

import mongoose from 'mongoose';

// This sub-schema defines the structure for each stock within a portfolio.
const StockInPortfolioSchema = new mongoose.Schema({
  ticker: {
    type: String,
    required: true,
  },
  // We can store the momentum score or other relevant metrics at the time of creation
  momentumScore: {
    type: Number,
  },
  // We can add the price at which it was added to the portfolio
  priceAtAddition: {
    type: Number,
  }
}, { _id: false }); // _id: false prevents Mongoose from creating an id for subdocuments

const PortfolioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Portfolio name is required.'], // e.g., "Momentum Portfolio - August 2025"
    unique: true,
  },
  strategy: {
    type: String,
    required: [true, 'Strategy type is required.'], // "Momentum" or "Alpha"
    enum: ['Momentum', 'Alpha'],
  },
  stocks: [StockInPortfolioSchema], // An array of stocks that make up the portfolio
  generationDate: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);

export default Portfolio;
