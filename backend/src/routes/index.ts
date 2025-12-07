import express from "express";
import authRoutes from "./authRoutes";
import { protect, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "MindEase API running", ai: "Serenity" });
});

router.use("/auth", authRoutes);

router.get("/protected", protect, (req: AuthRequest, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

export default router;
