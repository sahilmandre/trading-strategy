// File: jobs/schedule.js

import { calculateMomentumForAllStocks } from '../services/analysisService.js';
import StockData from '../models/stockDataModel.js';
import Portfolio from '../models/portfolioModel.js'; // Import portfolio model for later use

/**
 * This job fetches the latest momentum data for all stocks,
 * then updates or creates entries in the StockData collection in MongoDB.
 * This serves as a daily cache of the analysis results.
 */
export const runDailyStockUpdate = async () => {
  console.log('JOB_STARTED: Running daily stock data update...');
  try {
    const momentumData = await calculateMomentumForAllStocks();

    if (!momentumData || momentumData.length === 0) {
      console.log('JOB_INFO: No momentum data received from analysis service. Skipping update.');
      return;
    }

    // Using bulkWrite is much more efficient than updating one by one in a loop
    const operations = momentumData.map(stock => ({
      updateOne: {
        filter: { ticker: stock.ticker },
        update: { $set: stock },
        upsert: true, // If a stock doesn't exist in the DB, it will be created
      },
    }));

    const result = await StockData.bulkWrite(operations);
    console.log(`JOB_SUCCESS: Stock data updated. ${result.upsertedCount} docs created, ${result.modifiedCount} docs modified.`);

  } catch (error) {
    console.error('JOB_ERROR: An error occurred during the daily stock update job.', error);
  }
};

/**
 * This job will run once a month to generate the model portfolios.
 * We will implement the logic for this in a later step.
 */
export const runMonthlyPortfolioCreation = async () => {
    console.log('JOB_SKIPPED: Monthly portfolio creation job is not yet implemented.');
};
