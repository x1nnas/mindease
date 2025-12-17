import express from "express";
import { serenityChat } from "../ai/controllers/serenityController";

const router = express.Router();

router.post("/chat", serenityChat);

export default router;
