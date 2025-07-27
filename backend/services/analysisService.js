// File: services/analysisService.js

import yahooFinance from 'yahoo-finance2';
import { nifty500 } from '../config/nifty500.js';

/**
 * Calculates the percentage change between an old and a new value.
 */
const calculatePercentageChange = (oldPrice, newPrice) => {
  if (oldPrice === 0 || !oldPrice || !newPrice) return 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
};

/**
 * Runs a comprehensive analysis for all stocks, gathering technical and fundamental data
 * required for expert-level strategy filtering.
 */
export const runFullStockAnalysis = async () => {
  console.log('Starting EXPERT stock analysis...');
  const analysisResults = [];
  const today = new Date();
  const oneYearAgo = new Date(new Date().setFullYear(today.getFullYear() - 1));

  // --- Step 1: Get Market Performance (Nifty 500 Index) ---
  let marketPerf1Y = 0;
  try {
    const marketHistory = await yahooFinance.historical('^CRSLDX', { period1: oneYearAgo, period2: today });
    if (marketHistory.length > 0) {
      marketPerf1Y = calculatePercentageChange(marketHistory[0].close, marketHistory[marketHistory.length - 1].close);
      console.log(`[Analysis] Market 1-Year Performance: ${marketPerf1Y.toFixed(2)}%`);
    }
  } catch (error) {
    console.error(`[Analysis] Error fetching market data: ${error.message}`);
  }

  // --- Step 2: Analyze each stock ---
  for (let i = 0; i < nifty500.length; i++) {
    const ticker = nifty500[i];
    try {
      // We now need both historical data for performance and quote data for MAs, etc.
      const [historicalData, quoteData] = await Promise.all([
        yahooFinance.historical(ticker, { period1: oneYearAgo, period2: today }),
        yahooFinance.quote(ticker)
      ]);

      if (historicalData.length < 2 || !quoteData) {
        console.warn(`[Analysis] Insufficient data for ${ticker}. Skipping.`);
        continue;
      }
      
      const currentPrice = quoteData.regularMarketPrice;
      
      // --- Performance Calculation ---
      const perf1D = quoteData.regularMarketChangePercent;
      const perf1W = calculatePercentageChange(historicalData[historicalData.length - 5]?.close, currentPrice);
      const perf1M = calculatePercentageChange(historicalData[historicalData.length - 21]?.close, currentPrice);
      const perf3M = calculatePercentageChange(historicalData[historicalData.length - 63]?.close, currentPrice);
      const perf6M = calculatePercentageChange(historicalData[historicalData.length - 126]?.close, currentPrice);
      const perf1Y = calculatePercentageChange(historicalData[0]?.close, currentPrice);

      // --- Data for Expert Filters ---
      const fiftyDayAverage = quoteData.fiftyDayAverage;
      const hundredFiftyDayAverage = historicalData.slice(-150).reduce((sum, day) => sum + day.close, 0) / 150;
      const twoHundredDayAverage = quoteData.twoHundredDayAverage;
      const fiftyTwoWeekLow = quoteData.fiftyTwoWeekLow;
      const fiftyTwoWeekHigh = quoteData.fiftyTwoWeekHigh;
      const avgVolume50Day = quoteData.averageDailyVolume3Month; // A reasonable proxy
      const avgVolume200Day = historicalData.slice(-200).reduce((sum, day) => sum + day.volume, 0) / 200;
      
      // --- Simplified Fundamental Data (from what's available) ---
      const epsTrailingTwelveMonths = quoteData.epsTrailingTwelveMonths; // 'A' in CANSLIM
      const trailingPE = quoteData.trailingPE;

      analysisResults.push({
        ticker,
        longName: quoteData.longName,
        currentPrice,
        volume: quoteData.regularMarketVolume,
        marketCap: quoteData.marketCap,
        
        // Performance
        perf1D: perf1D?.toFixed(2),
        perf1W: perf1W?.toFixed(2),
        perf1M: perf1M?.toFixed(2),
        perf3M: perf3M?.toFixed(2),
        perf6M: perf6M?.toFixed(2),
        perf1Y: perf1Y?.toFixed(2),
        
        // Technicals for Minervini
        fiftyDayAverage,
        hundredFiftyDayAverage: hundredFiftyDayAverage.toFixed(2),
        twoHundredDayAverage,
        fiftyTwoWeekLow,
        fiftyTwoWeekHigh,
        avgVolume50Day,
        avgVolume200Day: avgVolume200Day.toFixed(0),

        // Fundamentals for CANSLIM (simplified)
        epsTrailingTwelveMonths,
        trailingPE,

        // Calculated fields
        alpha: (perf1Y - marketPerf1Y).toFixed(2),
      });

      console.log(`[Expert Analysis] Processed ${i + 1}/${nifty500.length}: ${ticker}`);

    } catch (error) {
      console.error(`[Expert Analysis] Failed to process ${ticker}: ${error.message}`);
    }
  }

  console.log('Expert stock analysis finished.');
  return analysisResults;
};
