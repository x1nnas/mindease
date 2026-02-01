import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth";
import JournalEntry from "../models/JournalEntry";

/**
 * Creates a new journal entry
 */
export const createJournalEntry = async (
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

    const { content, allowSerenityAccess } = req.body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      res.status(400).json({ message: "Content is required" });
      return;
    }

    const journalEntry = await JournalEntry.create({
      userId,
      content: content.trim(),
      allowSerenityAccess: allowSerenityAccess === true,
    });

    res.status(201).json({
      message: "Journal entry created successfully",
      journalEntry: {
        id: journalEntry._id,
        userId: journalEntry.userId,
        content: journalEntry.content,
        allowSerenityAccess: journalEntry.allowSerenityAccess,
        createdAt: journalEntry.createdAt,
      },
    });
  } catch (error) {
    console.error("Create journal entry error:", error);
    res.status(500).json({ message: "Failed to create journal entry" });
  }
};

/**
 * Gets all journal entries for the user, sorted by date (newest first)
 */
export const getAllJournalEntries = async (
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

    const journalEntries = await JournalEntry.find({ userId })
      .sort({ createdAt: -1 })
      .select("_id userId content allowSerenityAccess createdAt");

    res.status(200).json({
      journalEntries: journalEntries.map(entry => ({
        id: entry._id,
        userId: entry.userId,
        content: entry.content,
        allowSerenityAccess: entry.allowSerenityAccess,
        createdAt: entry.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get all journal entries error:", error);
    res.status(500).json({ message: "Failed to get journal entries" });
  }
};

/**
 * Gets a single journal entry by ID
 */
export const getJournalEntryById = async (
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

    const { id } = req.params;

    const journalEntry = await JournalEntry.findOne({
      _id: id,
      userId, // Ensure user can only access their own entries
    });

    if (!journalEntry) {
      res.status(404).json({ message: "Journal entry not found" });
      return;
    }

    res.status(200).json({
      journalEntry: {
        id: journalEntry._id,
        userId: journalEntry.userId,
        content: journalEntry.content,
        allowSerenityAccess: journalEntry.allowSerenityAccess,
        createdAt: journalEntry.createdAt,
      },
    });
  } catch (error) {
    console.error("Get journal entry error:", error);
    res.status(500).json({ message: "Failed to get journal entry" });
  }
};

/**
 * Updates a journal entry
 */
export const updateJournalEntry = async (
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

    const { id } = req.params;
    const { content, allowSerenityAccess } = req.body;

    const updateData: any = {};
    if (content !== undefined) {
      if (typeof content !== "string" || content.trim() === "") {
        res.status(400).json({ message: "Content cannot be empty" });
        return;
      }
      updateData.content = content.trim();
    }
    if (allowSerenityAccess !== undefined) {
      updateData.allowSerenityAccess = allowSerenityAccess === true;
    }

    const journalEntry = await JournalEntry.findOneAndUpdate(
      { _id: id, userId }, // Ensure user can only update their own entries
      updateData,
      { new: true, runValidators: true }
    );

    if (!journalEntry) {
      res.status(404).json({ message: "Journal entry not found" });
      return;
    }

    res.status(200).json({
      message: "Journal entry updated successfully",
      journalEntry: {
        id: journalEntry._id,
        userId: journalEntry.userId,
        content: journalEntry.content,
        allowSerenityAccess: journalEntry.allowSerenityAccess,
        createdAt: journalEntry.createdAt,
      },
    });
  } catch (error) {
    console.error("Update journal entry error:", error);
    res.status(500).json({ message: "Failed to update journal entry" });
  }
};

/**
 * Deletes a journal entry (hard delete for v1)
 */
export const deleteJournalEntry = async (
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

    const { id } = req.params;

    const journalEntry = await JournalEntry.findOneAndDelete({
      _id: id,
      userId, // Ensure user can only delete their own entries
    });

    if (!journalEntry) {
      res.status(404).json({ message: "Journal entry not found" });
      return;
    }

    res.status(200).json({
      message: "Journal entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete journal entry error:", error);
    res.status(500).json({ message: "Failed to delete journal entry" });
  }
};
