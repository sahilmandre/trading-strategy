// File: services/analysisService.js

import yahooFinance from "yahoo-finance2";
import { nifty500 } from "../config/nifty500.js";

const calculatePercentageChange = (oldPrice, newPrice) => {
  if (oldPrice === 0 || !oldPrice || !newPrice) return 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
};

export const runFullStockAnalysis = async () => {
  console.log("Starting EXPERT stock analysis...");
  const analysisResults = [];
  const today = new Date();
  const oneYearAgo = new Date(new Date().setFullYear(today.getFullYear() - 1));

  let marketPerf1Y = 0;
  try {
    const marketHistory = await yahooFinance.historical("^CRSLDX", {
      period1: oneYearAgo,
      period2: today,
    });
    if (marketHistory.length > 0) {
      marketPerf1Y = calculatePercentageChange(
        marketHistory[0].close,
        marketHistory[marketHistory.length - 1].close
      );
    }
  } catch (error) {
    console.error(`[Analysis] Error fetching market data: ${error.message}`);
  }

  for (let i = 0; i < nifty500.length; i++) {
    const ticker = nifty500[i];
    console.log(`[Analysis] Fetching data for ${ticker} (${i + 1}/${nifty500.length})`);
    try {
      const [historicalData, quoteData] = await Promise.all([
        yahooFinance.historical(ticker, {
          period1: oneYearAgo,
          period2: today,
        }),
        yahooFinance.quote(ticker),
      ]);

      if (historicalData.length < 2 || !quoteData) {
        console.warn(`[Analysis] Insufficient data for ${ticker}. Skipping.`);
        continue;
      }
      const currentPrice = quoteData.regularMarketPrice;
      const perf1D = quoteData.regularMarketChangePercent;
      const perf1W = calculatePercentageChange(
        historicalData[historicalData.length - 5]?.close,
        currentPrice
      );
      const perf1M = calculatePercentageChange(
        historicalData[historicalData.length - 21]?.close,
        currentPrice
      );
      const perf3M = calculatePercentageChange(
        historicalData[historicalData.length - 63]?.close,
        currentPrice
      );
      const perf6M = calculatePercentageChange(
        historicalData[historicalData.length - 126]?.close,
        currentPrice
      );
      const perf1Y = calculatePercentageChange(
        historicalData[0]?.close,
        currentPrice
      );

      // --- DEFINITIVE FIX: Calculate the momentum score here so it gets saved to the DB ---
      const momentumScore = perf3M * 0.4 + perf6M * 0.4 + perf1Y * 0.2;

      analysisResults.push({
        ticker,
        longName: quoteData.longName,
        currentPrice,
        volume: quoteData.regularMarketVolume,
        marketCap: quoteData.marketCap,
        perf1D: parseFloat(perf1D?.toFixed(2)),
        perf1W: parseFloat(perf1W?.toFixed(2)),
        perf1M: parseFloat(perf1M?.toFixed(2)),
        perf3M: parseFloat(perf3M?.toFixed(2)),
        perf6M: parseFloat(perf6M?.toFixed(2)),
        perf1Y: parseFloat(perf1Y?.toFixed(2)),
        fiftyDayAverage: quoteData.fiftyDayAverage,
        hundredFiftyDayAverage: parseFloat(
          (
            historicalData
              .slice(-150)
              .reduce((sum, day) => sum + day.close, 0) / 150
          ).toFixed(2)
        ),
        twoHundredDayAverage: quoteData.twoHundredDayAverage,
        fiftyTwoWeekLow: quoteData.fiftyTwoWeekLow,
        fiftyTwoWeekHigh: quoteData.fiftyTwoWeekHigh,
        avgVolume50Day: quoteData.averageDailyVolume3Month,
        avgVolume200Day: parseInt(
          historicalData.slice(-200).reduce((sum, day) => sum + day.volume, 0) /
            200
        ),
        epsTrailingTwelveMonths: quoteData.epsTrailingTwelveMonths,
        trailingPE: quoteData.trailingPE,
        alpha: parseFloat((perf1Y - marketPerf1Y).toFixed(2)),
        momentumScore: parseFloat(momentumScore.toFixed(2)), // <-- Add the score to the data
      });

      console.log(
        `[Expert Analysis] Processed ${i + 1}/${nifty500.length}: ${ticker}`
      );
    } catch (error) {
      console.error(
        `[Expert Analysis] Failed to process ${ticker}: ${error.message}`
      );
    }
  }
  return analysisResults;
};
