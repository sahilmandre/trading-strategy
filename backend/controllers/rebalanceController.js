// File: controllers/rebalanceController.js

import RebalanceState from '../models/rebalanceStateModel.js';

/**
 * Fetches the saved state of the rebalance tool from the database.
 * If no state exists, it creates and returns a default state.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const getRebalanceState = async (req, res) => {
  try {
    // Find the single document for the rebalance state.
    let state = await RebalanceState.findOne({ singletonId: 'global' });

    // If no state is found in the database, create a default one.
    if (!state) {
      console.log('No rebalance state found, creating a default one.');
      state = await RebalanceState.create({
        singletonId: 'global',
        totalAmount: 100000,
        stocks: [{ id: Date.now(), ticker: 'RELIANCE.NS', weight: 100, price: 0, shares: 0, amount: 100000 }],
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
 * Saves the current state of the rebalance tool to the database.
 * It uses 'upsert' to either update the existing document or create it if it doesn't exist.
 * @param {object} req - The Express request object, containing the state in its body.
 * @param {object} res - The Express response object.
 */
export const saveRebalanceState = async (req, res) => {
  try {
    const { totalAmount, stocks } = req.body;
    console.log('[rebalanceController] Received data for saving:', { totalAmount, stocks });

    // Find the single document and update it with the new state from the request body.
    // The 'upsert: true' option creates the document if it's not found.
    // The 'new: true' option returns the updated document.
    const updatedState = await RebalanceState.findOneAndUpdate(
      { singletonId: 'global' },
      { totalAmount, stocks },
      { new: true, upsert: true }
    );

    console.log('[rebalanceController] Updated state in DB:', updatedState);

    res.status(200).json({
      success: true,
      message: 'Rebalance state saved successfully.',
      data: updatedState,
    });
  } catch (error) {
    console.error(`[rebalanceController] Error in saveRebalanceState: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred while saving rebalance state.',
    });
  }
};
