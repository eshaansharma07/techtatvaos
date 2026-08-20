import mongoose, { Schema, model, models } from "mongoose";

const ArenaSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["DeepTech & AI", "Hardware & Speed", "Gaming & Community"],
      required: true 
    },
    description: { type: String },
    capacity: { type: Number, default: 0 },
    registeredCount: { type: Number, default: 0 },
    teamSize: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 1 }
    },
    prizePool: { type: String },
    rounds: [{ type: String }],
    status: { 
      type: String, 
      enum: ["upcoming", "active", "closed"], 
      default: "upcoming" 
    },
    isPublished: { type: Boolean, default: true },
    bracketData: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const Arena = models.Arena || model("Arena", ArenaSchema);
