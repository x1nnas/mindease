import mongoose, { Document, Schema } from "mongoose";

export interface IMoodCheckIn extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date; // Normalized to start-of-day UTC
  value: number; // 0-100
  label: string; // e.g., "Calm", "Feeling Amazing! ✨"
  createdAt: Date;
}

const moodCheckInSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compound unique index: one mood check-in per user per day
// This enforces "checked in today" logic at database level
// Also indexes userId for fast queries
moodCheckInSchema.index({ userId: 1, date: 1 }, { unique: true });

const MoodCheckIn = mongoose.model<IMoodCheckIn>("MoodCheckIn", moodCheckInSchema);

export default MoodCheckIn;
