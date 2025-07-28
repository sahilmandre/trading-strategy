// File: controllers/portfolioController.js

import Portfolio from '../models/portfolioModel.js';

/**
 * Controller to fetch all historical model portfolios, grouped by strategy.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const getAllPortfolios = async (req, res) => {
    console.log("Received request for /api/portfolios (all historical)");
    try {
        // Fetch all portfolios and sort them with the newest ones first
        const allPortfolios = await Portfolio.find({}).sort({ generationDate: -1 });

        if (!allPortfolios || allPortfolios.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No model portfolios found in the database.'
            });
        }

        // Separate the portfolios into two arrays based on their strategy
        const momentumPortfolios = allPortfolios.filter(p => p.strategy === 'Momentum');
        const alphaPortfolios = allPortfolios.filter(p => p.strategy === 'Alpha');

        res.status(200).json({
            success: true,
            data: {
                momentum: momentumPortfolios,
                alpha: alphaPortfolios
            }
        });

    } catch (error) {
        console.error(`[portfolioController] Error in getAllPortfolios: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred while fetching portfolios.',
        });
    }
};
