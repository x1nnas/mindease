import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth";
import MoodCheckIn from "../models/MoodCheckIn";

/**
 * Normalizes a date to start-of-day UTC
 * This ensures consistent date comparison regardless of timezone
 */
function normalizeDateToUTC(date: Date = new Date()): Date {
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Saves or updates a mood check-in for today
 * Enforces one mood check-in per user per day via compound unique index
 */
export const saveOrUpdateMoodCheckIn = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userIdString = req.user && typeof req.user === "object" 
      ? (req.user as any).id || (req.user as any)._id 
      : null;

    if (!userIdString) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    // Convert string ID from JWT to MongoDB ObjectId
    const userId = new mongoose.Types.ObjectId(userIdString);

    const { value, label } = req.body;

    if (value === undefined || value === null) {
      res.status(400).json({ message: "Value is required" });
      return;
    }

    if (typeof value !== "number" || value < 0 || value > 100) {
      res.status(400).json({ message: "Value must be a number between 0 and 100" });
      return;
    }

    if (!label || typeof label !== "string" || label.trim() === "") {
      res.status(400).json({ message: "Label is required" });
      return;
    }

    // Normalize date to start-of-day UTC
    const normalizedDate = normalizeDateToUTC();

    // Use findOneAndUpdate with upsert to create or update
    // The compound unique index ensures only one entry per user per day
    const moodCheckIn = await MoodCheckIn.findOneAndUpdate(
      { userId, date: normalizedDate },
      {
        userId,
        date: normalizedDate,
        value,
        label: label.trim(),
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Mood check-in saved successfully",
      moodCheckIn: {
        id: moodCheckIn._id,
        userId: moodCheckIn.userId,
        date: moodCheckIn.date,
        value: moodCheckIn.value,
        label: moodCheckIn.label,
        createdAt: moodCheckIn.createdAt,
      },
    });
  } catch (error: any) {
    // Handle duplicate key error (shouldn't happen due to upsert, but safety check)
    if (error.code === 11000) {
      res.status(409).json({ message: "Mood check-in already exists for this date" });
      return;
    }
    console.error("Mood check-in error:", error);
    res.status(500).json({ message: "Failed to save mood check-in" });
  }
};

/**
 * Gets the mood check-in for today
 */
export const getTodayMoodCheckIn = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userIdString = req.user && typeof req.user === "object" 
      ? (req.user as any).id || (req.user as any)._id 
      : null;

    if (!userIdString) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    // Convert string ID from JWT to MongoDB ObjectId
    const userId = new mongoose.Types.ObjectId(userIdString);

    const normalizedDate = normalizeDateToUTC();

    const moodCheckIn = await MoodCheckIn.findOne({
      userId,
      date: normalizedDate,
    });

    if (!moodCheckIn) {
      res.status(200).json({ moodCheckIn: null });
      return;
    }

    res.status(200).json({
      moodCheckIn: {
        id: moodCheckIn._id,
        userId: moodCheckIn.userId,
        date: moodCheckIn.date,
        value: moodCheckIn.value,
        label: moodCheckIn.label,
        createdAt: moodCheckIn.createdAt,
      },
    });
  } catch (error) {
    console.error("Get today mood check-in error:", error);
    res.status(500).json({ message: "Failed to get mood check-in" });
  }
};

/**
 * Gets the latest mood check-in
 */
export const getLatestMoodCheckIn = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userIdString = req.user && typeof req.user === "object" 
      ? (req.user as any).id || (req.user as any)._id 
      : null;

    if (!userIdString) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    // Convert string ID from JWT to MongoDB ObjectId
    const userId = new mongoose.Types.ObjectId(userIdString);

    const moodCheckIn = await MoodCheckIn.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!moodCheckIn) {
      res.status(200).json({ moodCheckIn: null });
      return;
    }

    res.status(200).json({
      moodCheckIn: {
        id: moodCheckIn._id,
        userId: moodCheckIn.userId,
        date: moodCheckIn.date,
        value: moodCheckIn.value,
        label: moodCheckIn.label,
        createdAt: moodCheckIn.createdAt,
      },
    });
  } catch (error) {
    console.error("Get latest mood check-in error:", error);
    res.status(500).json({ message: "Failed to get mood check-in" });
  }
};

/**
 * Gets all mood check-ins for the user, sorted by date (newest first)
 */
export const getAllMoodCheckIns = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userIdString = req.user && typeof req.user === "object" 
      ? (req.user as any).id || (req.user as any)._id 
      : null;

    if (!userIdString) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    // Convert string ID from JWT to MongoDB ObjectId
    const userId = new mongoose.Types.ObjectId(userIdString);

    const moodCheckIns = await MoodCheckIn.find({ userId })
      .sort({ createdAt: -1 })
      .select("_id userId date value label createdAt");

    res.status(200).json({
      moodCheckIns: moodCheckIns.map(m => ({
        id: m._id,
        userId: m.userId,
        date: m.date,
        value: m.value,
        label: m.label,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get all mood check-ins error:", error);
    res.status(500).json({ message: "Failed to get mood check-ins" });
  }
};
