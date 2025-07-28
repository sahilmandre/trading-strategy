// File: jobs/schedule.js

import { runFullStockAnalysis } from '../services/analysisService.js';
import StockData from '../models/stockDataModel.js';
import Portfolio from '../models/portfolioModel.js';
import { fetchQuoteData } from "../services/dataService.js";

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
        update: { $set: { ...stock, lastRefreshed: new Date() } },
        upsert: true,
      },
    }));
    await StockData.bulkWrite(operations);
    console.log(`JOB_SUCCESS: Stock data updated.`);
  } catch (error) {
    console.error(
      "JOB_ERROR: An error occurred during the daily stock update job.",
      error
    );
  }
};

/**
 * [NEW] This job runs daily to update the performance of all historical portfolios.
 */
export const runDailyPerformanceUpdate = async () => {
  console.log("JOB_STARTED: Running daily portfolio performance update...");
  try {
    const allPortfolios = await Portfolio.find({});
    if (allPortfolios.length === 0) {
      console.log("JOB_INFO: No portfolios found to update.");
      return;
    }

    // Get all unique tickers from all portfolios to fetch prices in one go
    const allTickers = [
      ...new Set(allPortfolios.flatMap((p) => p.stocks.map((s) => s.ticker))),
    ];
    const currentPriceData = await fetchQuoteData(allTickers);
    const priceMap = new Map(
      currentPriceData.map((s) => [s.symbol, s.regularMarketPrice])
    );

    for (const portfolio of allPortfolios) {
      let newCurrentValue = 0;
      for (const stock of portfolio.stocks) {
        const currentPrice = priceMap.get(stock.ticker);
        const priceAtAddition = stock.priceAtAddition;

        if (currentPrice && priceAtAddition > 0) {
          const returnRatio = currentPrice / priceAtAddition;
          // Each stock conceptually starts with a value of 100
          newCurrentValue += 100 * returnRatio;
        } else {
          // If price is unavailable, assume its value hasn't changed
          newCurrentValue += 100;
        }
      }

      const newCurrentReturnPercent =
        ((newCurrentValue - portfolio.initialValue) / portfolio.initialValue) *
        100;
      const newPeakReturn = Math.max(
        portfolio.peakReturnPercent || 0,
        newCurrentReturnPercent
      );
      const drawdown =
        (newCurrentValue /
          (portfolio.initialValue * (1 + newPeakReturn / 100)) -
          1) *
        100;
      const newMaxDrawdown = Math.min(
        portfolio.maxDrawdownPercent || 0,
        drawdown
      );

      portfolio.currentValue = newCurrentValue;
      portfolio.currentReturnPercent = newCurrentReturnPercent;
      portfolio.peakReturnPercent = newPeakReturn;
      portfolio.maxDrawdownPercent = newMaxDrawdown;
      portfolio.lastPerformanceUpdate = new Date();
      await portfolio.save();
    }
    console.log(
      `JOB_SUCCESS: Updated performance for ${allPortfolios.length} portfolios.`
    );
  } catch (error) {
    console.error(
      "JOB_ERROR: An error occurred during the daily performance update job.",
      error
    );
  }
};

/**
 * This job runs once a month to generate the model portfolios based on expert strategies.
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

    await Portfolio.updateMany(
      { isActive: true },
      { $set: { isActive: false } }
    );
    console.log("JOB_INFO: Deactivated all previously active portfolios.");

    // --- 1. Create "Momentum Kings" Portfolio ---
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
      const initialValue = 100 * topMomentumStocks.length; // Each stock starts with a value of 100
      await Portfolio.create({
        name: portfolioName,
        strategy: "Momentum",
        stocks: topMomentumStocks.map((s) => ({
          ticker: s.ticker,
          priceAtAddition: s.currentPrice,
          momentumScore: parseFloat(s.qualityMomentumScore.toFixed(2)),
        })),
        initialValue: initialValue,
        currentValue: initialValue,
      });
      console.log(`JOB_SUCCESS: Created "${portfolioName}".`);
    }

    // --- 2. Create "Alpha Titans" Portfolio ---
    const alphaCandidates = allStocks.filter(
      (stock) =>
        stock.alpha > 0 &&
        stock.epsTrailingTwelveMonths > 0 &&
        stock.trailingPE > 0
    );
    const topAlphaStocks = alphaCandidates
      .sort((a, b) => b.alpha - a.alpha)
      .slice(0, 10);

    if (topAlphaStocks.length > 0) {
      const portfolioName = `Alpha Titans - ${monthName} ${year}`;
      const initialValue = 100 * topAlphaStocks.length; // Each stock starts with a value of 100
      await Portfolio.create({
        name: portfolioName,
        strategy: "Alpha",
        stocks: topAlphaStocks.map((s) => ({
          ticker: s.ticker,
          priceAtAddition: s.currentPrice,
          alpha: parseFloat(s.alpha),
        })),
        initialValue: initialValue,
        currentValue: initialValue,
      });
      console.log(`JOB_SUCCESS: Created "${portfolioName}".`);
    }
  } catch (error) {
    console.error(
      "JOB_ERROR: An error occurred during the expert monthly portfolio creation job.",
      error
    );
  }
};
