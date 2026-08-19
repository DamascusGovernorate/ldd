import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  purpose: { type: String, enum: ["signup", "login"], required: true },
  codeHash: { type: String, required: true },
  fullName: String,
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);