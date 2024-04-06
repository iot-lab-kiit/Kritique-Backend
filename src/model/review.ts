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
    feedback: { type: String },
    status: {
      type: String,
      enum: ["validated", "not validated"],
      default: "validated",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
