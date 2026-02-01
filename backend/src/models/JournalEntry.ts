import mongoose, { Document, Schema } from "mongoose";

export interface IJournalEntry extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  allowSerenityAccess: boolean; // User consent for Serenity to access this entry
  createdAt: Date;
  // Note: deletedAt not included in v1, but schema designed to add it later
  // deletedAt?: Date;
}

const journalEntrySchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    allowSerenityAccess: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index userId for fast queries
journalEntrySchema.index({ userId: 1 });

// Index createdAt for sorting and date-based queries
journalEntrySchema.index({ createdAt: -1 }); // Descending for newest first

// Compound index for Serenity-accessible entries (future optimization)
journalEntrySchema.index({ userId: 1, allowSerenityAccess: 1 });

const JournalEntry = mongoose.model<IJournalEntry>("JournalEntry", journalEntrySchema);

export default JournalEntry;
