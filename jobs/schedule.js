// File: jobs/schedule.js

// --- Use the new, combined analysis function ---
import { runFullStockAnalysis } from '../services/analysisService.js';
import StockData from '../models/stockDataModel.js';
import Portfolio from '../models/portfolioModel.js';

/**
 * This job runs a full analysis (Momentum & Alpha) for all stocks,
 * then updates or creates entries in the StockData collection in MongoDB.
 * This serves as a daily cache of all analysis results.
 */
export const runDailyStockUpdate = async () => {
  console.log('JOB_STARTED: Running daily full stock data update (Momentum & Alpha)...');
  try {
    // --- Call the updated analysis function ---
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
            lastRefreshed: new Date() // Explicitly set the refresh time
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
 * This job will run once a month to generate the model portfolios.
 * We will implement the logic for this in a later step.
 */
export const runMonthlyPortfolioCreation = async () => {
    console.log('JOB_SKIPPED: Monthly portfolio creation job is not yet implemented.');
};
