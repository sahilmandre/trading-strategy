// File: controllers/benchmarkController.js

import yahooFinance from 'yahoo-finance2';
import googleFinance from "google-finance";
// The nseDataService is no longer used and has been removed.

/**
 * [DEFINITIVE FIX] Fetches one year of historical data for a given benchmark index.
 * This uses a robust, prioritized fallback system: Google Finance -> Yahoo Finance.
 * The backend is now responsible for translating standard names into API-specific tickers.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const getBenchmarkData = async (req, res) => {
  const { ticker } = req.query;

  if (!ticker) {
    return res
      .status(400)
      .json({ success: false, message: "Ticker query parameter is required." });
  }

  console.log(
    `[Benchmark] Attempting to fetch historical data for standard ticker: ${ticker}`
  );

  try {
    const today = new Date();
    const oneYearAgo = new Date(
      new Date().setFullYear(today.getFullYear() - 1)
    );
    let historicalData = [];

    // --- Ticker Translation Maps ---
    const googleTickerMap = {
      NIFTY_50: "INDEXNSE:NIFTY_50",
      NIFTY_500: "INDEXNSE:NIFTY_500",
      NIFTY_200: "INDEXNSE:NIFTY_200",
      NIFTY_ALPHA_50: "INDEXNSE:NIFTY_ALPHA_50",
      NIFTY200_MOMENTUM_30: "INDEXNSE:NIFTY200_MOMENTUM_30",
      NIFTY200_ALPHA_30: "INDEXNSE:NIFTY200_ALPHA_30",
    };

    const yahooTickerMap = {
      NIFTY_50: "^NSEI",
      NIFTY_500: "^CRSLDX",
      NIFTY_200: "^CNX200",
      NIFTY_ALPHA_50: "NIFTYALPHA50.NS",
      NIFTY200_MOMENTUM_30: "NIFTY200_MOMENTUM_30.NS",
      NIFTY200_ALPHA_30: "NIFTY200_ALPHA_30.NS",
    };

    // --- Tier 1: Try Google Finance first ---
    const googleTicker = googleTickerMap[ticker];
    if (googleTicker) {
      console.log(
        `[Benchmark] Tier 1: Attempting Google Finance with ticker: ${googleTicker}`
      );
      try {
        const googleData = await new Promise((resolve, reject) => {
          googleFinance.historical(
            { symbol: googleTicker, from: oneYearAgo, to: today },
            (err, quotes) => {
              if (err) return reject(err);
              resolve(quotes);
            }
          );
        });

        if (googleData && googleData.length > 60) {
          historicalData = googleData
            .map((d) => ({
              date: d.date,
              open: d.open,
              high: d.high,
              low: d.low,
              close: d.close,
              volume: d.volume,
            }))
            .reverse();
        }
      } catch (error) {
        console.error(
          `[Benchmark] Google Finance failed for ${googleTicker}: ${error.message}`
        );
      }
    }

    // --- Tier 2: If Google Finance fails or returns insufficient data, fall back to Yahoo Finance ---
    if (!historicalData || historicalData.length < 60) {
      const yahooTicker = yahooTickerMap[ticker];
      if (yahooTicker) {
        console.warn(
          `[Benchmark] Tier 2: Falling back to Yahoo Finance with ticker: ${yahooTicker}`
        );
        try {
          historicalData = await yahooFinance.historical(yahooTicker, {
            period1: oneYearAgo,
            period2: today,
          });
        } catch (error) {
          console.error(
            `[Benchmark] Yahoo Finance also failed for ${yahooTicker}: ${error.message}`
          );
          historicalData = [];
        }
      }
    }

    if (!historicalData || historicalData.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: `Could not find historical data for ${ticker} from any source.`,
        });
    }

    console.log(
      `[Benchmark] Successfully fetched ${historicalData.length} data points for ${ticker}.`
    );
    res.status(200).json({ success: true, data: historicalData });
  } catch (error) {
    console.error(
      `[benchmarkController] A critical error occurred while fetching data for ${ticker}: ${error.message}`
    );
    res
      .status(500)
      .json({
        success: false,
        message: `An internal server error occurred while fetching data for ${ticker}.`,
      });
  }
};
