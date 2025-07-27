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
 * Fetches historical data and calculates momentum and alpha metrics for all Nifty 500 stocks.
 * @returns {Promise<object[]>} A promise that resolves to an array of stocks with their analysis data.
 */
export const runFullStockAnalysis = async () => {
  console.log('Starting full stock analysis (Momentum & Alpha)...');
  const analysisResults = [];
  const today = new Date();
  const oneYearAgo = new Date(new Date().setFullYear(today.getFullYear() - 1));

  // --- Step 1: Get the market's performance (Nifty 500 Index) ---
  let marketPerf1Y = 0;
  try {
    const marketTicker = '^CRSLDX'; // Ticker for Nifty 500 on Yahoo Finance
    const marketHistory = await yahooFinance.historical(marketTicker, {
      period1: oneYearAgo,
      period2: today,
    });
    if (marketHistory.length > 0) {
      const marketStartPrice = marketHistory[0].close;
      const marketEndPrice = marketHistory[marketHistory.length - 1].close;
      marketPerf1Y = calculatePercentageChange(marketStartPrice, marketEndPrice);
      console.log(`[Analysis] Nifty 500 (Market) 1-Year Performance: ${marketPerf1Y.toFixed(2)}%`);
    } else {
      console.warn('[Analysis] Could not fetch market performance data.');
    }
  } catch (error) {
    console.error(`[Analysis] Error fetching market data: ${error.message}`);
  }


  // --- Step 2: Analyze each stock ---
  for (let i = 0; i < nifty500.length; i++) {
    const ticker = nifty500[i];
    try {
      const historicalData = await yahooFinance.historical(ticker, {
        period1: oneYearAgo,
        period2: today,
      });

      if (historicalData.length < 2) {
        console.warn(`[Analysis] Insufficient historical data for ${ticker}. Skipping.`);
        continue;
      }
      
      const latestData = historicalData[historicalData.length - 1];
      const previousData = historicalData[historicalData.length - 2];
      const currentPrice = latestData.close;
      const volume = latestData.volume;

      // --- Momentum Calculation ---
      const data1W = historicalData[historicalData.length - 5] || historicalData[0];
      const data1M = historicalData[historicalData.length - 21] || historicalData[0];
      const data3M = historicalData[historicalData.length - 63] || historicalData[0];
      const data6M = historicalData[historicalData.length - 126] || historicalData[0];
      const data1Y = historicalData[0];

      const perf1D = calculatePercentageChange(previousData.close, currentPrice);
      const perf1W = calculatePercentageChange(data1W.close, currentPrice);
      const perf1M = calculatePercentageChange(data1M.close, currentPrice);
      const perf3M = calculatePercentageChange(data3M.close, currentPrice);
      const perf6M = calculatePercentageChange(data6M.close, currentPrice);
      const perf1Y = calculatePercentageChange(data1Y.close, currentPrice);

      const momentumScore = (perf1D * 0.1) + (perf1W * 0.15) + (perf1M * 0.2) + (perf3M * 0.2) + (perf6M * 0.2) + (perf1Y * 0.15);
      
      // --- Alpha Calculation (Simplified) ---
      // Alpha = Stock's 1-Year Return - Market's 1-Year Return
      const alpha = perf1Y - marketPerf1Y;

      analysisResults.push({
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
        alpha: alpha.toFixed(2), // Add the new alpha value
      });

      console.log(`[Analysis] Processed ${i + 1}/${nifty500.length}: ${ticker}`);

    } catch (error) {
      console.error(`[Analysis] Failed to process ${ticker}: ${error.message}`);
    }
  }

  console.log('Full stock analysis finished.');
  return analysisResults;
};
