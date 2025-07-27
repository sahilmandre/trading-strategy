// File: controllers/portfolioController.js

import Portfolio from '../models/portfolioModel.js';

/**
 * Controller to fetch the latest generated model portfolios.
 * It finds the most recent portfolio for each strategy type.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const getLatestPortfolios = async (req, res) => {
    console.log("Received request for /api/portfolios");
    try {
        // Find the most recently created portfolio for the 'Momentum' strategy
        const latestMomentumPortfolio = await Portfolio.findOne({ strategy: 'Momentum' })
            .sort({ createdAt: -1 }); // Sort by creation date descending

        // Find the most recently created portfolio for the 'Alpha' strategy
        const latestAlphaPortfolio = await Portfolio.findOne({ strategy: 'Alpha' })
            .sort({ createdAt: -1 });

        if (!latestMomentumPortfolio && !latestAlphaPortfolio) {
            return res.status(404).json({
                success: false,
                message: 'No model portfolios found in the database. The monthly job may not have run yet.'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                momentum: latestMomentumPortfolio,
                alpha: latestAlphaPortfolio
            }
        });

    } catch (error) {
        console.error(`[portfolioController] Error in getLatestPortfolios: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred while fetching portfolios.',
        });
    }
};
