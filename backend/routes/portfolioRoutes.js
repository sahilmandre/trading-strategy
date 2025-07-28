// File: routes/portfolioRoutes.js

import express from 'express';
import { getAllPortfolios } from "../controllers/portfolioController.js";
import { getBenchmarkData } from "../controllers/benchmarkController.js";

const router = express.Router();

// @route   GET /api/portfolios
router.get("/", getAllPortfolios);

// --- FIX: Changed route to use a query parameter ---
// @route   GET /api/portfolios/benchmark?ticker=...
router.get("/benchmark", getBenchmarkData);

export default router;
