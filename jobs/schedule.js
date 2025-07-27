// File: jobs/schedule.js

import { runFullStockAnalysis } from '../services/analysisService.js';
import StockData from '../models/stockDataModel.js';
import Portfolio from '../models/portfolioModel.js';

/**
 * This job runs a full analysis (Momentum & Alpha) for all stocks,
 * then updates or creates entries in the StockData collection in MongoDB.
 */
export const runDailyStockUpdate = async () => {
  console.log("JOB_STARTED: Running daily EXPERT stock data update...");
  try {
    const analysisData = await runFullStockAnalysis();

    if (!analysisData || analysisData.length === 0) {
      console.log(
        "JOB_INFO: No analysis data received from service. Skipping update."
      );
      return;
    }

    const operations = analysisData.map((stock) => ({
      updateOne: {
        filter: { ticker: stock.ticker },
        update: {
          $set: {
            ...stock,
            lastRefreshed: new Date(),
          },
        },
        upsert: true,
      },
    }));

    const result = await StockData.bulkWrite(operations);
    console.log(
      `JOB_SUCCESS: Stock data updated. ${result.upsertedCount} docs created, ${result.modifiedCount} docs modified.`
    );
  } catch (error) {
    console.error(
      "JOB_ERROR: An error occurred during the daily stock update job.",
      error
    );
  }
};

/**
 * This job runs once a month to generate the model portfolios based on expert strategies.
 * It selects the top 10 stocks for both Momentum and Alpha strategies.
 */
export const runMonthlyPortfolioCreation = async () => {
  console.log("JOB_STARTED: Running EXPERT monthly portfolio creation...");
  try {
    const allStocks = await StockData.find().lean();
    if (allStocks.length === 0) {
      console.log(
        "JOB_INFO: No stock data in cache. Cannot create portfolios."
      );
      return;
    }

    const date = new Date();
    const monthName = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    // --- 1. Create "Momentum Kings" Portfolio ---
    console.log('Applying "Momentum Kings" strategy filters...');

    const perf6MValues = allStocks.map((s) => s.perf6M).sort((a, b) => a - b);
    const rsThreshold = perf6MValues[Math.floor(perf6MValues.length * 0.75)];

    const momentumCandidates = allStocks.filter((stock) => {
      const isPriceAboveMAs =
        stock.currentPrice > stock.fiftyDayAverage &&
        stock.currentPrice > stock.hundredFiftyDayAverage &&
        stock.currentPrice > stock.twoHundredDayAverage;
      const is150Above200 =
        stock.hundredFiftyDayAverage > stock.twoHundredDayAverage;
      const is50AboveMAs =
        stock.fiftyDayAverage > stock.hundredFiftyDayAverage &&
        stock.fiftyDayAverage > stock.twoHundredDayAverage;
      const isPriceNearHigh =
        stock.currentPrice >= stock.fiftyTwoWeekHigh * 0.75;
      const isPriceAboveLow =
        stock.currentPrice >= stock.fiftyTwoWeekLow * 1.25;
      const hasRelativeStrength = stock.perf6M >= rsThreshold;
      const hasVolumeInterest =
        stock.avgVolume50Day > stock.avgVolume200Day * 1.3;
      return (
        isPriceAboveMAs &&
        is150Above200 &&
        is50AboveMAs &&
        isPriceNearHigh &&
        isPriceAboveLow &&
        hasRelativeStrength &&
        hasVolumeInterest
      );
    });

    const topMomentumStocks = momentumCandidates
      .map((stock) => ({
        ...stock,
        qualityMomentumScore:
          stock.perf3M * 0.4 + stock.perf6M * 0.4 + stock.perf1Y * 0.2,
      }))
      .sort((a, b) => b.qualityMomentumScore - a.qualityMomentumScore)
      .slice(0, 10);

    if (topMomentumStocks.length > 0) {
      const portfolioName = `Momentum Kings - ${monthName} ${year}`;
      await Portfolio.findOneAndUpdate(
        { name: portfolioName },
        {
          name: portfolioName,
          strategy: "Momentum",
          stocks: topMomentumStocks.map((s) => ({
            ticker: s.ticker,
            priceAtAddition: s.currentPrice,
            momentumScore: parseFloat(s.qualityMomentumScore.toFixed(2)),
          })),
        },
        { upsert: true }
      );
      console.log(
        `JOB_SUCCESS: Created/updated "${portfolioName}" with ${topMomentumStocks.length} stocks.`
      );
    } else {
      console.log('JOB_INFO: No stocks passed the "Momentum Kings" filter.');
    }

    // --- 2. Create "Alpha Titans" Portfolio ---
    console.log('Applying "Alpha Titans" strategy filters...');

    const alphaCandidates = allStocks.filter((stock) => {
      const hasPositiveAlpha = stock.alpha > 0;
      const hasStrongEPS =
        stock.epsTrailingTwelveMonths > 0 && stock.trailingPE > 0;
      return hasPositiveAlpha && hasStrongEPS;
    });

    const topAlphaStocks = alphaCandidates
      .sort((a, b) => b.alpha - a.alpha)
      .slice(0, 10);

    if (topAlphaStocks.length > 0) {
      const portfolioName = `Alpha Titans - ${monthName} ${year}`;
      await Portfolio.findOneAndUpdate(
        { name: portfolioName },
        {
          name: portfolioName,
          strategy: "Alpha",
          stocks: topAlphaStocks.map((s) => ({
            ticker: s.ticker,
            priceAtAddition: s.currentPrice,
            alpha: parseFloat(s.alpha),
          })),
        },
        { upsert: true }
      );
      console.log(
        `JOB_SUCCESS: Created/updated "${portfolioName}" with ${topAlphaStocks.length} stocks.`
      );
    } else {
      console.log('JOB_INFO: No stocks passed the "Alpha Titans" filter.');
    }
  } catch (error) {
    console.error(
      "JOB_ERROR: An error occurred during the expert monthly portfolio creation job.",
      error
    );
  }
};
