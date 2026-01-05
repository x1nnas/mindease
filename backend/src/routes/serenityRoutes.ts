import express from "express";
import { serenityChat } from "../ai/controllers/serenityController";
import { serenityRateLimiter } from "../middleware/rateLimit";

const router = express.Router();

router.post("/chat", serenityRateLimiter, serenityChat);

export default router;
