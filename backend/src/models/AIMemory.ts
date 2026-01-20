import mongoose, { Document, Schema } from "mongoose";

/**
 * AI Memory Schema (Prepared for Future Implementation)
 * 
 * This schema will store memories that Serenity (the AI) creates about the user
 * based on conversations, mood patterns, and journal entries.
 * 
 * FUTURE USE:
 * - Store insights Serenity learns about the user
 * - Track patterns in mood and journal entries
 * - Enable Serenity to remember context across sessions
 * - Personalize responses based on user history
 * 
 * NOT IMPLEMENTED YET:
 * - Controllers, services, and routes are not created
 * - Schema is prepared for future implementation
 */
export interface IAIMemory extends Document {
  userId: mongoose.Types.ObjectId;
  content: string; // The memory content (what Serenity learned)
  source: "conversation" | "mood" | "journal" | "pattern"; // Where the memory came from
  createdAt: Date;
  // Note: deletedAt not included in v1, but schema designed to add it later
  // deletedAt?: Date;
}

const aiMemorySchema: Schema = new Schema(
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
    source: {
      type: String,
      enum: ["conversation", "mood", "journal", "pattern"],
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index userId for fast queries
aiMemorySchema.index({ userId: 1 });

// Index createdAt for sorting
aiMemorySchema.index({ createdAt: -1 }); // Descending for newest first

// Compound index for source-based queries (future optimization)
aiMemorySchema.index({ userId: 1, source: 1 });

const AIMemory = mongoose.model<IAIMemory>("AIMemory", aiMemorySchema);

export default AIMemory;
