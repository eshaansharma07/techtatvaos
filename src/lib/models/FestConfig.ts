import mongoose, { Schema, model, models } from "mongoose";

const FestConfigSchema = new Schema(
  {
    marqueeTicker: [{ type: String }],
    festDays: { type: Number, default: 3 },
    registrationOpen: { type: Boolean, default: true },
    sponsors: [
      {
        name: { type: String },
        tier: { type: String },
        logoUrl: { type: String }
      }
    ]
  },
  { timestamps: true }
);

export const FestConfig = models.FestConfig || model("FestConfig", FestConfigSchema);
