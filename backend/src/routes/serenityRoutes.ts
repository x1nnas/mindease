import express from "express";
import { serenityChat } from "../ai/controllers/serenityController";
import { serenityRateLimiter } from "../middleware/rateLimit";
import { dailyLimitMiddleware } from "../middleware/dailyLimit";
import { protect } from "../middleware/auth";

const router = express.Router();

// Keep chat login-only for the current release.
// If guest mode is introduced later, switch `protect` to `optionalAuth`.
// Middleware order: auth first, then minute-level limiter, then daily limiter.
router.post("/chat", protect, serenityRateLimiter, dailyLimitMiddleware, serenityChat);

export default router;
