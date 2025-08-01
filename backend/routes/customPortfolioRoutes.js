// File: backend/routes/customPortfolioRoutes.js

import express from 'express';
import {
  createPortfolio,
  getPortfolios,
  getPortfolioDetails, // <-- Import new controller
  addStockToPortfolio,
  exitStockFromPortfolio,
} from '../controllers/customPortfolioController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes in this file are protected
router.use(protect);

router.route('/')
  .post(createPortfolio)
  .get(getPortfolios);

router.route('/:id')
  .get(getPortfolioDetails); // <-- Add new route for getting details

router.post('/:id/add', addStockToPortfolio);
router.post('/:id/exit-stock', exitStockFromPortfolio);

export default router;
