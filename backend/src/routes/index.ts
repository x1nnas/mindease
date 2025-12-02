import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "MindEase API is running", ai: "Serenity" });
});

export default router;


