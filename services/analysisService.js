// File: services/analysisService.js

import yahooFinance from 'yahoo-finance2';
import { nifty500 } from '../config/nifty500.js';

/**
 * Calculates the percentage change between an old and a new value.
 * @param {number} oldPrice - The starting price.
 * @param {number} newPrice - The ending price.
 * @returns {number} The percentage change.
 */
const calculatePercentageChange = (oldPrice, newPrice) => {
  if (oldPrice === 0 || !oldPrice || !newPrice) return 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
};

/**
 * Fetches historical data and calculates momentum metrics for all Nifty 500 stocks.
 * @returns {Promise<object[]>} A promise that resolves to a sorted array of stocks with their momentum data.
 */
export const calculateMomentumForAllStocks = async () => {
  console.log('Starting momentum calculation for all Nifty 500 stocks...');
  const momentumResults = [];
  const today = new Date();
  
  // We need data from at least a year ago to make all calculations
  const oneYearAgo = new Date(new Date().setFullYear(today.getFullYear() - 1));

  for (let i = 0; i < nifty500.length; i++) {
    const ticker = nifty500[i];
    try {
      // Fetch historical data for the past year
      const historicalData = await yahooFinance.historical(ticker, {
        period1: oneYearAgo,
        period2: today,
      });

      if (historicalData.length < 2) {
        console.warn(`[Momentum] Insufficient historical data for ${ticker}. Skipping.`);
        continue;
      }
      
      // Get the most recent data points
      const latestData = historicalData[historicalData.length - 1];
      const previousData = historicalData[historicalData.length - 2];

      const currentPrice = latestData.close;
      const volume = latestData.volume;

      // Find data points for different timeframes
      const data1W = historicalData[historicalData.length - 5] || historicalData[0];
      const data1M = historicalData[historicalData.length - 21] || historicalData[0];
      const data3M = historicalData[historicalData.length - 63] || historicalData[0];
      const data6M = historicalData[historicalData.length - 126] || historicalData[0];
      const data1Y = historicalData[0];

      // Calculate performance for each period
      const perf1D = calculatePercentageChange(previousData.close, currentPrice);
      const perf1W = calculatePercentageChange(data1W.close, currentPrice);
      const perf1M = calculatePercentageChange(data1M.close, currentPrice);
      const perf3M = calculatePercentageChange(data3M.close, currentPrice);
      const perf6M = calculatePercentageChange(data6M.close, currentPrice);
      const perf1Y = calculatePercentageChange(data1Y.close, currentPrice);

      // Calculate a simple momentum score by averaging the periods
      // We give higher weight to more recent performance
      const momentumScore = (perf1D * 0.1) + (perf1W * 0.15) + (perf1M * 0.2) + (perf3M * 0.2) + (perf6M * 0.2) + (perf1Y * 0.15);
      
      momentumResults.push({
        ticker,
        currentPrice,
        volume,
        perf1D: perf1D.toFixed(2),
        perf1W: perf1W.toFixed(2),
        perf1M: perf1M.toFixed(2),
        perf3M: perf3M.toFixed(2),
        perf6M: perf6M.toFixed(2),
        perf1Y: perf1Y.toFixed(2),
        momentumScore: momentumScore.toFixed(2),
      });

      // Log progress to the console
      console.log(`[Momentum] Processed ${i + 1}/${nifty500.length}: ${ticker}`);

    } catch (error) {
      console.error(`[Momentum] Failed to process ${ticker}: ${error.message}`);
    }
  }

  // Sort the results by momentum score in descending order
  momentumResults.sort((a, b) => b.momentumScore - a.momentumScore);

  console.log('Momentum calculation finished.');
  return momentumResults;
};
