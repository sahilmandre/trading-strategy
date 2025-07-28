// File: controllers/backtestController.js

import yahooFinance from 'yahoo-finance2';

// Helper to calculate the start date based on a period string (e.g., '3m')
const getStartDate = (period) => {
    const date = new Date();
    switch (period) {
        case '3m':
            date.setMonth(date.getMonth() - 3);
            break;
        case '6m':
            date.setMonth(date.getMonth() - 6);
            break;
        case '1y':
            date.setFullYear(date.getFullYear() - 1);
            break;
        default:
            // Default to 3 months if period is invalid
            date.setMonth(date.getMonth() - 3);
            break;
    }
    return date;
};

export const getBacktestData = async (req, res) => {
    const { tickers, period } = req.query; // e.g., tickers=RELIANCE.NS,TCS.NS&period=6m

    if (!tickers || !period) {
        return res.status(400).json({ success: false, message: 'Tickers and period query parameters are required.' });
    }

    const tickerArray = tickers.split(',');
    const startDate = getStartDate(period);
    const today = new Date();

    try {
        // Fetch historical data for all tickers in parallel
        const allHistoricalData = await Promise.all(
            tickerArray.map(ticker =>
                yahooFinance.historical(ticker, { period1: startDate, period2: today }).catch(e => []) // Return empty array on error for a single ticker
            )
        );

        const validHistoricalData = allHistoricalData.filter(d => d.length > 0);
        if (validHistoricalData.length === 0) {
            return res.status(404).json({ success: false, message: 'Could not fetch historical data for any provided tickers.' });
        }

        // Normalize each stock's performance to start at a value of 100
        const normalizedData = validHistoricalData.map(stockHistory => {
            const firstValue = stockHistory[0].close;
            return stockHistory.map(day => ({
                date: new Date(day.date).toISOString().split('T')[0], // Normalize date format
                normalizedPrice: (day.close / firstValue) * 100,
            }));
        });

        // Group the normalized prices by date
        const dailyPricesMap = new Map();
        normalizedData.forEach(stockHistory => {
            stockHistory.forEach(day => {
                if (!dailyPricesMap.has(day.date)) {
                    dailyPricesMap.set(day.date, []);
                }
                dailyPricesMap.get(day.date).push(day.normalizedPrice);
            });
        });

        // Calculate the average performance for each day (equal weighting)
        const backtestResult = Array.from(dailyPricesMap.entries()).map(([date, prices]) => {
            const averagePerformance = prices.reduce((sum, price) => sum + price, 0) / prices.length;
            return {
                date: date,
                // The return is the average performance minus the initial value of 100
                portfolioReturn: averagePerformance - 100,
            };
        }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date chronologically

        res.status(200).json({ success: true, data: backtestResult });

    } catch (error) {
        console.error(`[backtestController] Error: ${error.message}`);
        res.status(500).json({ success: false, message: 'An internal server error occurred during backtesting.' });
    }
};
