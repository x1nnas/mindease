import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

/**
 * Simple in-memory daily limit tracker
 * Tracks requests per user/IP per day
 * Resets at midnight UTC
 */
interface DailyLimitEntry {
  count: number;
  resetDate: string; // YYYY-MM-DD format
}

const dailyLimits = new Map<string, DailyLimitEntry>();

// Get today's date string (YYYY-MM-DD) in UTC
function getTodayUTC(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Clean up old entries (older than 2 days) to prevent memory leaks
function cleanupOldEntries(): void {
  const today = getTodayUTC();
  for (const [key, entry] of dailyLimits.entries()) {
    if (entry.resetDate < today) {
      dailyLimits.delete(key);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupOldEntries, 60 * 60 * 1000);

/**
 * Daily limit middleware for AI API requests
 * Limits requests per user/IP per day to prevent cost overruns
 * 
 * Budget calculation:
 * - $8/month budget = ~13,000 requests/month
 * - 10-20 users = ~650-1,300 requests/user/month
 * - ~22-43 requests/user/day
 * - Set to 50/day for safety buffer
 */
export const dailyLimitMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Skip if AI is disabled (no costs)
  if (process.env.AI_ENABLED !== "true") {
    next();
    return;
  }

  // Get limit from env (default: 50 requests/day)
  const maxRequestsPerDay = parseInt(
    process.env.AI_DAILY_LIMIT || "50",
    10
  );

  // Generate key: user ID if authenticated, otherwise IP
  let key: string;
  const authReq = req as AuthRequest;
  if (authReq.user && typeof authReq.user === "object") {
    const userId = (authReq.user as any).id || (authReq.user as any)._id;
    if (userId) {
      key = `user:${userId}`;
    } else {
      key = `ip:${req.ip || req.socket.remoteAddress || "unknown"}`;
    }
  } else {
    key = `ip:${req.ip || req.socket.remoteAddress || "unknown"}`;
  }

  const today = getTodayUTC();
  const entry = dailyLimits.get(key);

  // Check if entry exists and is for today
  if (entry && entry.resetDate === today) {
    // Check if limit exceeded
    if (entry.count >= maxRequestsPerDay) {
      res.status(429).json({
        message: `Daily limit reached. You've used ${maxRequestsPerDay} messages today. Please try again tomorrow.`,
        limit: maxRequestsPerDay,
        remaining: 0,
      });
      return;
    }
    // Increment count
    entry.count += 1;
  } else {
    // New day or new user/IP - reset count
    dailyLimits.set(key, {
      count: 1,
      resetDate: today,
    });
  }

  // Add remaining count to response headers
  const currentEntry = dailyLimits.get(key)!;
  res.setHeader("X-RateLimit-Limit", maxRequestsPerDay.toString());
  res.setHeader("X-RateLimit-Remaining", (maxRequestsPerDay - currentEntry.count).toString());
  res.setHeader("X-RateLimit-Reset", new Date(today + "T23:59:59Z").getTime().toString());

  next();
};
