// File: index.js

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";

// --- Route Imports ---
import stockRoutes from "./routes/stockRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import rebalanceRoutes from "./routes/rebalanceRoutes.js";
import backtestRoutes from "./routes/backtestRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// --- Job Imports ---
import {
  runDailyStockUpdate,
  runMonthlyPortfolioCreation,
  runDailyPerformanceUpdate,
  runIntradayStockUpdate, // <-- Import the new job
} from "./jobs/schedule.js";

// --- Basic Setup ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB."))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// --- API Routes ---
app.use("/api/stocks", stockRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/rebalance", rebalanceRoutes);
app.use("/api/backtest", backtestRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Stock Screener API!");
});

// --- Scheduled Tasks (Cron Jobs) ---
console.log("🕒 Setting up scheduled jobs...");

// Read schedules from environment variables with defaults
const intradayUpdateSchedule =
  process.env.INTRADAY_UPDATE_SCHEDULE || "*/15 * * * *";
const dailyStockUpdateSchedule =
  process.env.DAILY_STOCK_UPDATE_SCHEDULE || "0 1 * * *";
const dailyPerformanceUpdateSchedule =
  process.env.DAILY_PERFORMANCE_UPDATE_SCHEDULE || "0 2 * * *";
const monthlyPortfolioCreationSchedule =
  process.env.MONTHLY_PORTFOLIO_CREATION_SCHEDULE || "0 3 1 * *";

// NEW: Intraday update job
cron.schedule(intradayUpdateSchedule, runIntradayStockUpdate, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});
console.log(
  `[JOB SCHEDULED] Intraday Stock Update at: ${intradayUpdateSchedule}`
);

cron.schedule(dailyStockUpdateSchedule, runDailyStockUpdate, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});
console.log(
  `[JOB SCHEDULED] Daily Stock Update at: ${dailyStockUpdateSchedule}`
);

cron.schedule(dailyPerformanceUpdateSchedule, runDailyPerformanceUpdate, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});
console.log(
  `[JOB SCHEDULED] Daily Performance Update at: ${dailyPerformanceUpdateSchedule}`
);

cron.schedule(monthlyPortfolioCreationSchedule, runMonthlyPortfolioCreation, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});
console.log(
  `[JOB SCHEDULED] Monthly Portfolio Creation at: ${monthlyPortfolioCreationSchedule}`
);

// --- Start Server ---
app.listen(PORT, () => {
  console.log("================================================");
  console.log(`🚀 SERVER IS UP AND RUNNING ON PORT: ${PORT}`);
  console.log("================================================\n");
});
