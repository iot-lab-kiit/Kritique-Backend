import mongoose, { Schema } from "mongoose";
const facultySchema = new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String, required: true },
    experience: { type: String },
    photoUrl: { type: String },
    avgRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    reviewList: { type: Schema.Types.ObjectId, ref: "Review" },
  },
  { timestamps: true }
);

const FacultyModel = mongoose.model("Faculty", facultySchema);
export default FacultyModel;
