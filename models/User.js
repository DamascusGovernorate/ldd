import mongoose from "mongoose";
import { DAMASCUS_NEIGHBORHOODS } from "@/lib/neighborhoods";

const DegreeSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["primary", "intermediate", "high_school", "bachelor", "master", "phd"],
      required: true,
    },
    specialization: String,
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    // xp_project_manager grants the dashboard tab. Authority over a project
    // still comes from Project.admins — the two are kept in sync by
    // PATCH /api/projects/[id]/managers.
    role: {
      type: String,
      enum: ["admin", "user", "news_reporter", "xp_project_manager"],
      default: "user",
    },
    emailVerified: { type: Boolean, default: false },
    xpPoints: { type: Number, default: 0 },
    profile: {
      mobilePhone: String,
      age: Number,
      gender: { type: String, enum: ["male", "female"] },
      neighborhood: { type: String, enum: DAMASCUS_NEIGHBORHOODS },
      degrees: { type: [DegreeSchema], validate: (v) => v.length <= 3 },
      certificateImage: String,
      idImage: String,
      avatar: String,
      completed: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
