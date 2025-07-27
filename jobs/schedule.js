// File: jobs/schedule.js

import { runFullStockAnalysis } from '../services/analysisService.js';
import StockData from '../models/stockDataModel.js';
import Portfolio from '../models/portfolioModel.js';

/**
 * This job runs a full analysis (Momentum & Alpha) for all stocks,
 * then updates or creates entries in the StockData collection in MongoDB.
 */
export const runDailyStockUpdate = async () => {
  console.log('JOB_STARTED: Running daily full stock data update (Momentum & Alpha)...');
  try {
    const analysisData = await runFullStockAnalysis();

    if (!analysisData || analysisData.length === 0) {
      console.log('JOB_INFO: No analysis data received from service. Skipping update.');
      return;
    }

    const operations = analysisData.map(stock => ({
      updateOne: {
        filter: { ticker: stock.ticker },
        update: { 
          $set: {
            ...stock,
            lastRefreshed: new Date()
          } 
        },
        upsert: true,
      },
    }));

    const result = await StockData.bulkWrite(operations);
    console.log(`JOB_SUCCESS: Stock data updated. ${result.upsertedCount} docs created, ${result.modifiedCount} docs modified.`);

  } catch (error) {
    console.error('JOB_ERROR: An error occurred during the daily stock update job.', error);
  }
};

/**
 * This job runs once a month to generate the model portfolios.
 * It selects the top 20 stocks for both Momentum and Alpha strategies.
 */
export const runMonthlyPortfolioCreation = async () => {
    console.log('JOB_STARTED: Running monthly portfolio creation...');
    try {
        const date = new Date();
        const monthName = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();

        // 1. Create Momentum Portfolio
        const topMomentumStocks = await StockData.find()
            .sort({ momentumScore: -1 })
            .limit(20)
            .lean(); // .lean() returns plain JS objects, which is faster

        if (topMomentumStocks.length > 0) {
            const momentumPortfolioName = `Momentum Portfolio - ${monthName} ${year}`;
            await Portfolio.findOneAndUpdate(
                { name: momentumPortfolioName },
                {
                    name: momentumPortfolioName,
                    strategy: 'Momentum',
                    stocks: topMomentumStocks.map(s => ({
                        ticker: s.ticker,
                        momentumScore: s.momentumScore,
                        priceAtAddition: s.currentPrice
                    }))
                },
                { upsert: true, new: true } // Upsert ensures we don't create duplicates if job runs twice
            );
            console.log(`JOB_SUCCESS: Successfully created/updated ${momentumPortfolioName}`);
        } else {
            console.log('JOB_INFO: No momentum stocks found to create portfolio.');
        }

        // 2. Create Alpha Portfolio
        const topAlphaStocks = await StockData.find({ alpha: { $gt: 0 } })
            .sort({ alpha: -1 })
            .limit(20)
            .lean();
        
        if (topAlphaStocks.length > 0) {
            const alphaPortfolioName = `Alpha Portfolio - ${monthName} ${year}`;
            await Portfolio.findOneAndUpdate(
                { name: alphaPortfolioName },
                {
                    name: alphaPortfolioName,
                    strategy: 'Alpha',
                    stocks: topAlphaStocks.map(s => ({
                        ticker: s.ticker,
                        alpha: s.alpha,
                        priceAtAddition: s.currentPrice
                    }))
                },
                { upsert: true, new: true }
            );
            console.log(`JOB_SUCCESS: Successfully created/updated ${alphaPortfolioName}`);
        } else {
            console.log('JOB_INFO: No alpha stocks found to create portfolio.');
        }

    } catch (error) {
        console.error('JOB_ERROR: An error occurred during the monthly portfolio creation job.', error);
    }
};
