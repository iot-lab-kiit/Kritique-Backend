import mongoose, { Schema } from "mongoose";
const facultySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    experience: { type: String },
    photoUrl: { type: String },
    avgRating: { type: Number },
    totalRatings: { type: Number },
    reviewList: { type: Schema.Types.ObjectId, ref: "Review", required: true },
  },
  { timestamps: true }
);

const FacultyModel = mongoose.model("Faculty", facultySchema);
export default FacultyModel;
