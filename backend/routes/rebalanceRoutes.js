// File: routes/rebalanceRoutes.js

import express from 'express';
import {
  getRebalanceState,
  saveRebalanceState,
} from '../controllers/rebalanceController.js';
import { protect } from "../middleware/authMiddleware.js"; // Import the middleware

const router = express.Router();

// Apply the 'protect' middleware to both routes.
// Now, a user must be logged in to access these endpoints.
router
  .route("/")
  .get(protect, getRebalanceState)
  .post(protect, saveRebalanceState);

export default router;
