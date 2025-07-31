// backend/models/alertModel.js
import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ticker: { type: String, required: true, uppercase: true },
    targetPrice: { type: Number, required: true },
    condition: { type: String, required: true, enum: ["above", "below"] },
    isActive: { type: Boolean, default: true },
    telegramChatId: { type: String, required: true }, // User's Telegram Chat ID
  },
  { timestamps: true }
);

const Alert = mongoose.model("Alert", AlertSchema);
export default Alert;
