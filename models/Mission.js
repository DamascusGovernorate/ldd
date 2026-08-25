import mongoose from "mongoose";

const ApplicantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { _id: false }
);

/** Nine factors, each scored 0–5 by the project manager when a mission ends. */
const RatingSchema = new mongoose.Schema(
  {
    quality: { type: Number, min: 0, max: 5 },        // جودة التنفيذ
    impact: { type: Number, min: 0, max: 5 },         // الأثر المجتمعي
    volunteering: { type: Number, min: 0, max: 5 },   // المشاركة التطوعية
    teamwork: { type: Number, min: 0, max: 5 },       // تنظيم الفريق
    schedule: { type: Number, min: 0, max: 5 },       // الالتزام بالخطة والمدة
    safety: { type: Number, min: 0, max: 5 },         // السلامة والمسؤولية
    resources: { type: Number, min: 0, max: 5 },      // كفاءة استخدام الموارد
    sustainability: { type: Number, min: 0, max: 5 }, // الاستدامة
    transparency: { type: Number, min: 0, max: 5 },   // التوثيق والشفافية
  },
  { _id: false }
);

const ParticipationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    /** did they actually show up — "no" ends the evaluation and awards nothing */
    completed: Boolean,
    ratings: RatingSchema,
    /** mean of the nine factors, 0–5 */
    average: { type: Number, min: 0, max: 5 },
    /** what was actually credited, kept for auditing */
    awardedXP: { type: Number, default: 0 },
  },
  { _id: false }
);

const MissionSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true },
    summary: String,
    objectives: [String],
    // "main" = مهمة رئيسية · "side" = مهمة فرعية
    type: { type: String, enum: ["main", "side"], default: "main" },
    icon: String,
    images: [String],
    neighborhood: { type: String, required: true },
    googleMapsUrl: String,

    // upcoming = تبدأ قريباً (on the map, open for applications)
    // active   = جارية      (on the map, applications closed)
    // ended    = منتهية     (off the map, hidden from volunteers)
    // "open"/"closed" are the legacy values — run scripts/migrate-mission-status.mjs
    // once to convert them, they remain in the enum so old documents still save.
    status: {
      type: String,
      enum: ["upcoming", "active", "ended", "open", "closed"],
      default: "upcoming",
    },
    startedAt: Date,
    endedAt: Date,

    applicants: [ApplicantSchema],
    participation: [ParticipationSchema],
    xpReward: { type: Number, default: 5 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

MissionSchema.index({ project: 1, neighborhood: 1, status: 1 });

export default mongoose.models.Mission || mongoose.model("Mission", MissionSchema);
