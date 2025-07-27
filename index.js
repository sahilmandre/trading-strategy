// File: index.js

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import { nifty500 } from "./config/nifty500.js";

// --- Route Imports ---
import stockRoutes from "./routes/stockRoutes.js";
// We will add portfolioRoutes here later

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
  .then(() => console.log("Successfully connected to MongoDB."))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// --- API Routes ---
// All stock-related routes are now handled by the stockRoutes file.
app.use("/api/stocks", stockRoutes);
// We will add the portfolio routes here later.

// A simple root route to confirm the server is running.
app.get("/", (req, res) => {
  res.send("Welcome to the Stock Screener API!");
});

// --- Scheduled Tasks (Cron Jobs) ---
cron.schedule("* * * * *", () => {
  // We will replace this with our actual job logic later.
  // console.log('Scheduled task running.');
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
