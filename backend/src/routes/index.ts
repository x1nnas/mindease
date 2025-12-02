import express from "express";
import authRoutes from "./authRoutes";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "MindEase API running", ai: "Serenity" });
});

router.use("/auth", authRoutes);

export default router;
