// File: controllers/rebalanceController.js

import RebalanceState from '../models/rebalanceStateModel.js';

/**
 * Fetches the saved rebalance state for the currently logged-in user.
 * If no state exists, it creates and returns a default state for that user.
 */
export const getRebalanceState = async (req, res) => {
  try {
    // Find the rebalance state document associated with the logged-in user's ID
    let state = await RebalanceState.findOne({ user: req.user.id });

    if (!state) {
      console.log(
        `No rebalance state found for user ${req.user.id}, creating a default one.`
      );
      state = await RebalanceState.create({
        user: req.user.id, // Associate the new state with the user
        totalAmount: 100000,
        stocks: [
          {
            id: Date.now(),
            ticker: "RELIANCE.NS",
            weight: 100,
            price: 0,
            shares: 0,
            amount: 0,
            unusedCash: 0,
          },
        ],
      });
    }

    res.status(200).json({
      success: true,
      data: state,
    });
  } catch (error) {
    console.error(`[rebalanceController] Error in getRebalanceState: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred while fetching rebalance state.',
    });
  }
};

/**
 * Saves the rebalance state for the currently logged-in user.
 * It uses 'upsert' to update the user's document or create it if it doesn't exist.
 */
export const saveRebalanceState = async (req, res) => {
  try {
    const { totalAmount, stocks } = req.body;

    // Find the document for the current user and update it.
    // If it doesn't exist (upsert: true), create it and automatically add the user field.
    const updatedState = await RebalanceState.findOneAndUpdate(
      { user: req.user.id },
      { totalAmount, stocks, user: req.user.id }, // Ensure user ID is set on creation
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Rebalance state saved successfully.",
      data: updatedState,
    });
  } catch (error) {
    console.error(
      `[rebalanceController] Error in saveRebalanceState: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message:
        "An internal server error occurred while saving rebalance state.",
    });
  }
};
