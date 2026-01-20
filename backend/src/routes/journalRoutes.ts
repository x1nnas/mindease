import express from "express";
import {
  createJournalEntry,
  getAllJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
} from "../controllers/journalController";
import { protect } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post("/", createJournalEntry);
router.get("/", getAllJournalEntries);
router.get("/:id", getJournalEntryById);
router.put("/:id", updateJournalEntry);
router.delete("/:id", deleteJournalEntry);

export default router;
