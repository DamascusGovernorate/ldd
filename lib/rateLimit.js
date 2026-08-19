import mongoose from "mongoose";

const RateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});
const RateLimit = mongoose.models.RateLimit || mongoose.model("RateLimit", RateLimitSchema);

export async function checkRateLimit(key, { max, windowMs }) {
  const now = new Date();
  const doc = await RateLimit.findOne({ key });

  if (!doc || doc.expiresAt < now) {
    await RateLimit.findOneAndUpdate(
      { key },
      { count: 1, expiresAt: new Date(now.getTime() + windowMs) },
      { upsert: true }
    );
    return { allowed: true };
  }
  if (doc.count >= max) return { allowed: false };

  doc.count += 1;
  await doc.save();
  return { allowed: true };
}