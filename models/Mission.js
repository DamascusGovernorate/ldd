import mongoose from "mongoose";

const ApplicantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { _id: false }
);

const ParticipationSchema = new mongoose.Schema(
  { user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, completed: Boolean },
  { _id: false }
);

const MissionSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true },
    summary: String,
    objectives: [String],
    icon: String,
    images: [String],
    neighborhood: { type: String, required: true },
    googleMapsUrl: String,
    status: { type: String, enum: ["open", "closed"], default: "open" },
    applicants: [ApplicantSchema],
    participation: [ParticipationSchema],
    xpReward: { type: Number, default: 5 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Mission || mongoose.model("Mission", MissionSchema);