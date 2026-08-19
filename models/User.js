import mongoose from "mongoose";

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
    role: { type: String, enum: ["admin", "user", "news_reporter"], default: "user" },
    emailVerified: { type: Boolean, default: false },
    profile: {
      mobilePhone: String,
      age: Number,
      gender: { type: String, enum: ["male", "female"] },
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