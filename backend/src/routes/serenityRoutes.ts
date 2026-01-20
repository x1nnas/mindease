import express from "express";
import { serenityChat } from "../ai/controllers/serenityController";
import { serenityRateLimiter } from "../middleware/rateLimit";
import { dailyLimitMiddleware } from "../middleware/dailyLimit";

const router = express.Router();

// Apply both rate limiting (per minute) and daily limit (per day)
// Order matters: rate limit first (faster check), then daily limit
router.post("/chat", serenityRateLimiter, dailyLimitMiddleware, serenityChat);

export default router;
