// File: index.js

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import { nifty500 } from "./config/nifty500.js";

// --- Route Imports ---
import stockRoutes from "./routes/stockRoutes.js";

// --- Job Imports ---
import {
  runDailyStockUpdate,
  runMonthlyPortfolioCreation,
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

if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined in the .env file.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB."))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// --- API Routes ---
app.use("/api/stocks", stockRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Stock Screener API!");
});

// --- Scheduled Tasks (Cron Jobs) ---
console.log("🕒 Setting up scheduled jobs...");

// This job updates our stock data cache. Runs every hour at minute 0.
cron.schedule("0 * * * *", runDailyStockUpdate, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});

// This job creates the monthly model portfolios. Runs on the 1st of every month.
cron.schedule("0 1 1 * *", runMonthlyPortfolioCreation, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});

// --- Start Server & Initial Job Run ---
app.listen(PORT, () => {
  console.log("================================================");
  console.log(`🚀 SERVER IS UP AND RUNNING ON PORT: ${PORT}`);
  console.log("================================================\n");

  // Run the update job once on server start for immediate data.
  console.log(
    ">>> TRIGGERING INITIAL DATA ANALYSIS JOB. THIS WILL TAKE SEVERAL MINUTES. <<<"
  );
  console.log(
    '>>> PLEASE WAIT FOR THE "JOB_SUCCESS" MESSAGE IN THE LOGS. <<<\n'
  );
  runDailyStockUpdate();
});
