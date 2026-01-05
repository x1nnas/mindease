import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Request } from "express";
import { AuthRequest } from "./auth";

// Simple rate limiter to prevent runaway loops and cost overruns
// More lenient for development, can be tightened in production
export const serenityRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10), // 1 minute default
  max: parseInt(process.env.RATE_LIMIT_MAX || "30", 10), // 30 requests per minute default
  message: {
    message: "Too many requests. Please slow down and try again in a moment.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise use IP address (IPv6-safe)
    const authReq = req as AuthRequest;
    if (authReq.user && typeof authReq.user === "object") {
      const userId = (authReq.user as any).id || (authReq.user as any)._id;
      if (userId) {
        return `user:${userId}`;
      }
    }
    // Use ipKeyGenerator helper for IPv6-safe IP handling
    // ipKeyGenerator takes the IP string (req.ip), not the request object
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    return `ip:${ipKeyGenerator(ip)}`;
  },
  skip: (req: Request) => {
    // Skip rate limiting if AI is disabled (no API costs)
    return process.env.AI_ENABLED !== "true";
  },
});

