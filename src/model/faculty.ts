import mongoose, { Schema } from "mongoose";
const facultySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    experience: { type: Number, required: true },
    photoUrl: { type: String, default: "" },
    avgRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    reviewList: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);
export default mongoose.model("Faculty", facultySchema);
