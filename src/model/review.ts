import mongoose, { Schema } from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdFor: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    rating: {
      type: Number,
      required: true,
      min: 1.0,
      max: 5.0,
      validate: {
        validator: Number.isFinite,
        message: "{VALUE} is not in the range 1.0 - 5.0",
      },
    },
    teachingRating: {
      type: Number,
      min: 1.0,
      max: 5.0,
      default: null,
    },
    behaviourRating: {
      type: Number,
      min: 1.0,
      max: 5.0,
      default: null,
    },
    marksRating: {
      type: Number,
      min: 1.0,
      max: 5.0,
      default: null,
    },
    feedback: { type: String },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["validated", "not validated"],
      default: "not validated",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Review", reviewSchema);
