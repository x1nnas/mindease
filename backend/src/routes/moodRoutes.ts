import express from "express";
import {
  saveOrUpdateMoodCheckIn,
  getTodayMoodCheckIn,
  getLatestMoodCheckIn,
  getAllMoodCheckIns,
} from "../controllers/moodController";
import { protect } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post("/", saveOrUpdateMoodCheckIn);
router.get("/today", getTodayMoodCheckIn);
router.get("/latest", getLatestMoodCheckIn);
router.get("/", getAllMoodCheckIns);

export default router;
