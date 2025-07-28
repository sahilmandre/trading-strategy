// File: jobs/schedule.js

import { runFullStockAnalysis } from '../services/analysisService.js';
import StockData from '../models/stockDataModel.js';
import Portfolio from '../models/portfolioModel.js';
import { fetchQuoteData } from "../services/dataService.js";
import yahooFinance from "yahoo-finance2"; // Import yahooFinance for historical fetch

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
 * [FIXED] This job runs daily to update the performance of all historical portfolios.
 */
export const runDailyPerformanceUpdate = async () => {
  console.log("JOB_STARTED: Running daily portfolio performance update...");
  try {
    const allPortfolios = await Portfolio.find({});
    if (allPortfolios.length === 0) {
      console.log("JOB_INFO: No portfolios found to update.");
      return;
    }

    const allTickers = [
      ...new Set(allPortfolios.flatMap((p) => p.stocks.map((s) => s.ticker))),
    ];
    if (allTickers.length === 0) return;

    const currentPriceData = await fetchQuoteData(allTickers);
    const priceMap = new Map(
      currentPriceData.map((s) => [s.symbol, s.regularMarketPrice])
    );

    for (const portfolio of allPortfolios) {
      let newCurrentValue = 0;
      const weightPerStock = portfolio.initialValue / portfolio.stocks.length;

      for (const stock of portfolio.stocks) {
        const currentPrice = priceMap.get(stock.ticker);
        const priceAtAddition = stock.priceAtAddition;

        if (currentPrice && priceAtAddition > 0) {
          const returnRatio = currentPrice / priceAtAddition;
          newCurrentValue += weightPerStock * returnRatio;
        } else {
          newCurrentValue += weightPerStock;
        }
      }

      const newCurrentReturnPercent =
        ((newCurrentValue - portfolio.initialValue) / portfolio.initialValue) *
        100;
      const newPeakReturn = Math.max(
        portfolio.peakReturnPercent || 0,
        newCurrentReturnPercent
      );

      const peakValue = portfolio.initialValue * (1 + newPeakReturn / 100);
      const drawdown =
        peakValue > 0 ? (newCurrentValue / peakValue - 1) * 100 : 0;
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
 * [FIXED] This job runs once a month to generate the model portfolios based on expert strategies.
 */
export const runMonthlyPortfolioCreation = async () => {
  console.log("JOB_STARTED: Running EXPERT monthly portfolio creation...");
  try {
    const allStocks = await StockData.find().lean();
    if (allStocks.length === 0) return;

    const date = new Date();
    const monthName = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    await Portfolio.updateMany(
      { isActive: true },
      { $set: { isActive: false } }
    );

    // --- Helper function to get previous day's close for testing ---
    const getEntryPrice = async (ticker) => {
      try {
        const history = await yahooFinance.historical(ticker, {
          period1: new Date(new Date().setDate(date.getDate() - 5)),
        });
        if (history.length > 1) {
          return history[history.length - 2].close; // Yesterday's close
        }
        return allStocks.find((s) => s.ticker === ticker).currentPrice; // Fallback to current price
      } catch {
        return allStocks.find((s) => s.ticker === ticker).currentPrice; // Fallback
      }
    };

    // --- 1. Create "Momentum Kings" Portfolio ---
    const perf6MValues = allStocks.map((s) => s.perf6M).sort((a, b) => a - b);
    const rsThreshold = perf6MValues[Math.floor(perf6MValues.length * 0.75)];
    const momentumCandidates = allStocks.filter(
      (stock) =>
        stock.currentPrice > stock.fiftyDayAverage &&
        stock.currentPrice > stock.hundredFiftyDayAverage &&
        stock.currentPrice > stock.twoHundredDayAverage &&
        stock.hundredFiftyDayAverage > stock.twoHundredDayAverage &&
        stock.fiftyDayAverage > stock.hundredFiftyDayAverage &&
        stock.currentPrice >= stock.fiftyTwoWeekHigh * 0.75 &&
        stock.currentPrice >= stock.fiftyTwoWeekLow * 1.25 &&
        stock.perf6M >= rsThreshold &&
        stock.avgVolume50Day > stock.avgVolume200Day * 1.3
    );
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
      const initialValue = 100 * topMomentumStocks.length;
      const stocksWithEntryPrice = await Promise.all(
        topMomentumStocks.map(async (s) => ({
          ticker: s.ticker,
          priceAtAddition: await getEntryPrice(s.ticker),
          momentumScore: parseFloat(s.qualityMomentumScore.toFixed(2)),
        }))
      );
      await Portfolio.findOneAndUpdate(
        { name: portfolioName },
        {
          name: portfolioName,
          strategy: "Momentum",
          stocks: stocksWithEntryPrice,
          initialValue,
          currentValue: initialValue,
          isActive: true,
          generationDate: date,
        },
        { upsert: true, new: true }
      );
      console.log(`JOB_SUCCESS: Created/updated "${portfolioName}".`);
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
      const initialValue = 100 * topAlphaStocks.length;
      const stocksWithEntryPrice = await Promise.all(
        topAlphaStocks.map(async (s) => ({
          ticker: s.ticker,
          priceAtAddition: await getEntryPrice(s.ticker),
          alpha: parseFloat(s.alpha),
        }))
      );
      await Portfolio.findOneAndUpdate(
        { name: portfolioName },
        {
          name: portfolioName,
          strategy: "Alpha",
          stocks: stocksWithEntryPrice,
          initialValue,
          currentValue: initialValue,
          isActive: true,
          generationDate: date,
        },
        { upsert: true, new: true }
      );
      console.log(`JOB_SUCCESS: Created/updated "${portfolioName}".`);
    }
  } catch (error) {
    console.error(
      "JOB_ERROR: An error occurred during the expert monthly portfolio creation job.",
      error
    );
  }
};
