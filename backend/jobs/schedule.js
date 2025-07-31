// File: jobs/schedule.js

import { runFullStockAnalysis } from "../services/analysisService.js";
import StockData from "../models/stockDataModel.js";
import Portfolio from "../models/portfolioModel.js";
import Alert from '../models/alertModel.js'; // <-- FIX: Import Alert model
import { fetchQuoteData as fetchQuotesForMultipleTickers } from "../services/dataService.js";
import yahooFinance from "yahoo-finance2";
import { sendTelegramMessage } from "../services/telegramService.js";

// --- HELPER FUNCTION ---
const calculatePercentageChange = (oldPrice, newPrice) => {
  if (oldPrice === 0 || !oldPrice || !newPrice) return 0;
  return parseFloat((((newPrice - oldPrice) / oldPrice) * 100).toFixed(2));
};



/**
 * NEW: This job runs every 5 minutes to check for triggered price alerts.
 */
export const runAlertChecks = async () => {
  console.log("[JOB_STARTED] Running price alert checks...");
  try {
    const activeAlerts = await Alert.find({ isActive: true });
    if (activeAlerts.length === 0) {
      console.log("[JOB_INFO] No active alerts to check.");
      return;
    }

    const uniqueTickers = [...new Set(activeAlerts.map(alert => alert.ticker))];
    const liveQuotes = await fetchQuotesForMultipleTickers(uniqueTickers);
    const priceMap = new Map(liveQuotes.map(q => [q.symbol, q.regularMarketPrice]));

    for (const alert of activeAlerts) {
      const currentPrice = priceMap.get(alert.ticker);
      if (!currentPrice) continue;

      let triggered = false;
      if (alert.condition === 'above' && currentPrice > alert.targetPrice) {
        triggered = true;
      } else if (alert.condition === 'below' && currentPrice < alert.targetPrice) {
        triggered = true;
      }

      if (triggered) {
        const message = `📈 **Price Alert!**\n\n\`${alert.ticker}\` has crossed your target.\n\n*Target:* ${alert.condition} ₹${alert.targetPrice}\n*Current Price:* ₹${currentPrice.toFixed(2)}`;
        sendTelegramMessage(alert.telegramChatId, message);

        // Deactivate the alert to prevent duplicate notifications
        alert.isActive = false;
        await alert.save();
        console.log(`[ALERT_TRIGGERED] Sent notification for ${alert.ticker} to user ${alert.user}`);
      }
    }
    console.log(`[JOB_SUCCESS] Finished checking ${activeAlerts.length} alerts.`);
  } catch (error) {
    console.error("[JOB_ERROR] An error occurred during the alert checking job.", error);
  }
};

/**
 * NEW: This job runs frequently to update prices and key metrics.
 * It fetches live prices and recalculates all performance data, then updates the DB.
 */
export const runIntradayStockUpdate = async () => {
  console.log(
    "[JOB_STARTED] Running intraday stock price and metric update..."
  );
  try {
    const allStocksFromDB = await StockData.find()
      .select("ticker perf1D perf1W perf1M perf3M perf6M perf1Y")
      .lean();
    if (allStocksFromDB.length === 0) {
      console.log(
        "[JOB_INFO] No stocks in DB to update. Skipping intraday job."
      );
      return;
    }
    const tickers = allStocksFromDB.map((s) => s.ticker);

    const liveQuotes = await fetchQuotesForMultipleTickers(tickers);
    if (liveQuotes.length === 0) {
      console.warn(
        "[JOB_WARN] Could not fetch any live quotes. Aborting update."
      );
      return;
    }
    const priceMap = new Map(liveQuotes.map((q) => [q.symbol, q]));

    const operations = [];
    for (const stock of allStocksFromDB) {
      const quote = priceMap.get(stock.ticker);
      if (
        quote &&
        quote.regularMarketPrice &&
        quote.regularMarketPreviousClose
      ) {
        const livePrice = quote.regularMarketPrice;
        const yesterdayClose = quote.regularMarketPreviousClose;

        const oldPerf1D = stock.perf1D || 0;
        const oldPerf1W = stock.perf1W || 0;
        const oldPerf1M = stock.perf1M || 0;
        const oldPerf3M = stock.perf3M || 0;
        const oldPerf6M = stock.perf6M || 0;
        const oldPerf1Y = stock.perf1Y || 0;

        const perf1D = calculatePercentageChange(yesterdayClose, livePrice);
        const dailyChange = perf1D - oldPerf1D;

        const perf1W = oldPerf1W + dailyChange;
        const perf1M = oldPerf1M + dailyChange;
        const perf3M = oldPerf3M + dailyChange;
        const perf6M = oldPerf6M + dailyChange;
        const perf1Y = oldPerf1Y + dailyChange;

        const momentumScore = parseFloat(
          (perf3M * 0.4 + perf6M * 0.4 + perf1Y * 0.2).toFixed(2)
        );

        operations.push({
          updateOne: {
            filter: { ticker: stock.ticker },
            update: {
              $set: {
                currentPrice: livePrice,
                perf1D,
                perf1W: parseFloat(perf1W.toFixed(2)),
                perf1M: parseFloat(perf1M.toFixed(2)),
                perf3M: parseFloat(perf3M.toFixed(2)),
                perf6M: parseFloat(perf6M.toFixed(2)),
                perf1Y: parseFloat(perf1Y.toFixed(2)),
                momentumScore,
                lastRefreshed: new Date(),
              },
            },
          },
        });
      }
    }

    if (operations.length > 0) {
      await StockData.bulkWrite(operations);
      console.log(
        `[JOB_SUCCESS] Intraday update successful. Updated ${operations.length} stocks in the database.`
      );
    } else {
      console.log("[JOB_INFO] No stocks had new prices to update.");
    }
  } catch (error) {
    console.error(
      "[JOB_ERROR] An error occurred during the intraday stock update job.",
      error
    );
  }
};

// --- EXISTING JOBS ---
export const runDailyStockUpdate = async () => {
  console.log("JOB_STARTED: Running daily EXPERT stock data update...");
  try {
    const analysisData = await runFullStockAnalysis();
    if (!analysisData || analysisData.length === 0) {
      console.log(
        "JOB_INFO: No analysis data received. Skipping daily update."
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
    console.log(
      `JOB_SUCCESS: Daily stock data updated for ${operations.length} stocks.`
    );
  } catch (error) {
    console.error(
      "JOB_ERROR: An error occurred during the daily stock update job.",
      error
    );
  }
};

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

    const currentPriceData = await fetchQuotesForMultipleTickers(allTickers);
    const priceMap = new Map(
      currentPriceData.map((s) => [s.symbol, s.regularMarketPrice])
    );

    for (const portfolio of allPortfolios) {
      const previousValue = portfolio.currentValue; // <-- Store the old value before recalculating
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

      // --- NEW: Calculate Day's Return ---
      const dayReturnPercent = previousValue
        ? ((newCurrentValue - previousValue) / previousValue) * 100
        : 0;

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

      // --- Update portfolio with all new and existing values ---
      portfolio.previousValue = previousValue;
      portfolio.currentValue = newCurrentValue;
      portfolio.dayReturnPercent = dayReturnPercent;
      portfolio.currentReturnPercent = newCurrentReturnPercent;
      portfolio.peakReturnPercent = newPeakReturn;
      portfolio.maxDrawdownPercent = newMaxDrawdown;
      portfolio.lastPerformanceUpdate = new Date();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const existingEntryIndex = portfolio.performanceHistory.findIndex(
        (entry) => new Date(entry.date).toDateString() === today.toDateString()
      );
      const newHistoryEntry = {
        date: today,
        portfolioReturn: newCurrentReturnPercent,
      };

      if (existingEntryIndex > -1) {
        portfolio.performanceHistory[existingEntryIndex] = newHistoryEntry;
      } else {
        portfolio.performanceHistory.push(newHistoryEntry);
      }

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
    const getEntryPrice = async (ticker) => {
      try {
        const history = await yahooFinance.historical(ticker, {
          period1: new Date(new Date().setDate(date.getDate() - 5)),
        });
        if (history.length > 1) return history[history.length - 2].close;
        return allStocks.find((s) => s.ticker === ticker).currentPrice;
      } catch {
        return allStocks.find((s) => s.ticker === ticker).currentPrice;
      }
    };
    const perf6MValues = allStocks.map((s) => s.perf6M).sort((a, b) => a - b);
    const rsThreshold = perf6MValues[Math.floor(perf6MValues.length * 0.75)];
    const momentumCandidates = allStocks.filter(
      (stock) =>
        stock.momentumScore > 0 &&
        stock.currentPrice > stock.fiftyDayAverage &&
        stock.currentPrice > stock.twoHundredDayAverage &&
        stock.hundredFiftyDayAverage > stock.twoHundredDayAverage &&
        stock.currentPrice >= stock.fiftyTwoWeekHigh * 0.75 &&
        stock.perf6M >= rsThreshold
    );
    const topMomentumStocks = momentumCandidates
      .sort((a, b) => b.momentumScore - a.momentumScore)
      .slice(0, 10);
    if (topMomentumStocks.length > 0) {
      const portfolioName = `Momentum Kings - ${monthName} ${year}`;
      const initialValue = 100 * topMomentumStocks.length;
      const stocksWithEntryPrice = await Promise.all(
        topMomentumStocks.map(async (s) => ({
          ticker: s.ticker,
          priceAtAddition: await getEntryPrice(s.ticker),
          momentumScore: s.momentumScore,
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
          performanceHistory: [{ date: date, portfolioReturn: 0 }],
        },
        { upsert: true, new: true }
      );
      console.log(`JOB_SUCCESS: Created/updated "${portfolioName}".`);
    }
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
          alpha: s.alpha,
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
          performanceHistory: [{ date: date, portfolioReturn: 0 }],
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
