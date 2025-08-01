// File: backend/routes/adminRoutes.js

import express from 'express';
import {
  triggerIntradayUpdate,
  triggerDailyAnalysis,
  triggerPerformanceUpdate,
  triggerPortfolioCreation,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// All routes in this file are protected and for admins only
router.use(protect, admin);

router.post('/run-intraday-update', triggerIntradayUpdate);
router.post('/run-daily-analysis', triggerDailyAnalysis);
router.post('/run-performance-update', triggerPerformanceUpdate);
router.post('/run-portfolio-creation', triggerPortfolioCreation);

export default router;
