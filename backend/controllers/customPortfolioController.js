// File: backend/controllers/customPortfolioController.js

import CustomPortfolio from '../models/customPortfolioModel.js';
import Trade from '../models/tradeModel.js';
import StockData from '../models/stockDataModel.js';

// ... (createPortfolio and getPortfolios functions remain unchanged)
export const createPortfolio = async (req, res) => {
  const { portfolioName } = req.body;
  if (!portfolioName) {
    return res.status(400).json({ success: false, message: 'Portfolio name is required.' });
  }
  try {
    const portfolio = await CustomPortfolio.create({
      portfolioName,
      user: req.user.id,
      totalInvested: 0,
      currentValue: 0,
    });
    res.status(201).json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while creating portfolio.' });
  }
};

export const getPortfolios = async (req, res) => {
  try {
    const portfolios = await CustomPortfolio.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: portfolios });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching portfolios.' });
  }
};


/**
 * @desc    Get details for a single custom portfolio, including its trades
 * @route   GET /api/my-portfolios/:id
 * @access  Private
 */
export const getPortfolioDetails = async (req, res) => {
    try {
        const portfolio = await CustomPortfolio.findOne({ _id: req.params.id, user: req.user.id }).lean();
        if (!portfolio) {
            return res.status(404).json({ success: false, message: 'Portfolio not found.' });
        }

        const trades = await Trade.find({ portfolio: req.params.id, user: req.user.id }).sort({ tradeDate: -1 });

        res.status(200).json({
            success: true,
            data: {
                ...portfolio,
                trades,
            },
        });
    } catch (error) {
        console.error(`[customPortfolioController] Error in getPortfolioDetails: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error while fetching portfolio details.' });
    }
};


// ... (addStockToPortfolio and exitStockFromPortfolio functions remain unchanged)
export const addStockToPortfolio = async (req, res) => {
  const { ticker, quantity, price, tradeDate } = req.body;
  const portfolioId = req.params.id;
  try {
    const portfolio = await CustomPortfolio.findOne({ _id: portfolioId, user: req.user.id });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found.' });
    }
    const stockExists = await StockData.findOne({ ticker: ticker.toUpperCase() });
    if (!stockExists) {
      return res.status(404).json({ success: false, message: `Stock ticker ${ticker} not found in our database.` });
    }
    const trade = await Trade.create({
      user: req.user.id,
      portfolio: portfolioId,
      ticker: ticker.toUpperCase(),
      quantity,
      price,
      tradeDate,
      tradeType: 'buy',
      status: 'open',
    });
    portfolio.totalInvested += quantity * price;
    await portfolio.save();
    res.status(201).json({ success: true, data: trade });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while adding stock.' });
  }
};

export const exitStockFromPortfolio = async (req, res) => {
    const { tradeId, exitPrice } = req.body;
    try {
      const trade = await Trade.findOne({ _id: tradeId, user: req.user.id, status: 'open' });
      if (!trade) {
        return res.status(404).json({ success: false, message: 'Open trade not found.' });
      }
      trade.status = 'closed';
      trade.realizedPnL = (exitPrice - trade.price) * trade.quantity;
      await trade.save();
      await Trade.create({
          user: req.user.id,
          portfolio: trade.portfolio,
          ticker: trade.ticker,
          quantity: trade.quantity,
          price: exitPrice,
          tradeDate: new Date(),
          tradeType: 'sell',
          status: 'closed',
          closingTradeFor: trade._id,
          realizedPnL: trade.realizedPnL,
      });
      const portfolio = await CustomPortfolio.findById(trade.portfolio);
      if (portfolio) {
          portfolio.totalInvested -= trade.quantity * trade.price;
          await portfolio.save();
      }
      res.status(200).json({ success: true, data: trade });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error while exiting stock.' });
    }
};
