// File: index.js

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import { nifty500 } from "./config/nifty500.js"; // Assuming nifty500.js is in the same directory

// --- Basic Setup ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
// CORS is enabled to allow requests from our React frontend
app.use(cors());
// This allows the server to understand JSON in request bodies
app.use(express.json());

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined in the .env file.");
  process.exit(1); // Exit the application if the database connection string is not found
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB."))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// --- API Routes (Placeholders) ---
// We will create a dedicated file for routes later to keep this file clean.

app.get("/", (req, res) => {
  res.send("Welcome to the Stock Screener API!");
});

// Placeholder for the momentum endpoint
app.get("/api/momentum", (req, res) => {
  res.json({ message: "Momentum data will be here." });
});

// Placeholder for the alpha endpoint
app.get("/api/alpha", (req, res) => {
  res.json({ message: "Alpha data will be here." });
});

// Placeholder for the portfolios endpoint
app.get("/api/portfolios", (req, res) => {
  res.json({ message: "Model portfolio data will be here." });
});

// Placeholder for the quotes endpoint
app.get("/api/quotes", (req, res) => {
  const { tickers } = req.query;
  if (!tickers) {
    return res
      .status(400)
      .json({ error: "Tickers query parameter is required." });
  }
  res.json({ message: `Current price data for ${tickers} will be here.` });
});

// --- Scheduled Tasks (Cron Jobs) ---
// This is where we'll schedule our daily and monthly data processing tasks.
// For now, it's just a placeholder.

// Example of a cron job that runs every minute for testing purposes
cron.schedule("0 */60 * * * *", () => {
  console.log(
    "This is a scheduled task running every 60 minutes. We will use this for our updates."
  );
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  console.log(`Available stocks for analysis: ${nifty500.length}`);
});
