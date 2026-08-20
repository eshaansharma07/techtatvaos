import mongoose, { Schema, model, models } from "mongoose";

const RegistrationSchema = new Schema(
  {
    registrationId: { type: String, required: true, unique: true, index: true },
    arenaId: { type: Schema.Types.ObjectId, ref: "Arena", required: true },
    teamName: { type: String },
    leader: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      college: { type: String },
      uid: { type: String, required: true }
    },
    members: [
      {
        name: { type: String },
        email: { type: String },
        uid: { type: String }
      }
    ],
    subCategory: { type: String }, // For esports title
    paymentStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },
    attended: { type: Boolean, default: false },
    checkpointsCleared: [{ type: Number }],
  },
  { timestamps: true }
);

export const FestRegistration = models.FestRegistration || model("FestRegistration", RegistrationSchema);
