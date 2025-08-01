// File: backend/routes/adminRoutes.js

import express from 'express';
import {
  triggerIntradayUpdate,
  triggerDailyAnalysis,
  triggerPerformanceUpdate,
  triggerPortfolioCreation,
  getAllUsers,
  updateUserAdminStatus,
  deleteUser,
  broadcastTelegramMessage,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// All routes in this file are protected and for admins only
router.use(protect, admin);

// Job Triggers
router.post("/run-intraday-update", triggerIntradayUpdate);
router.post("/run-daily-analysis", triggerDailyAnalysis);
router.post("/run-performance-update", triggerPerformanceUpdate);
router.post("/run-portfolio-creation", triggerPortfolioCreation);

// User Management
router.route("/users").get(getAllUsers);

router.route("/users/:id").put(updateUserAdminStatus).delete(deleteUser);

// Notifications
router.post("/broadcast-message", broadcastTelegramMessage);

export default router;
