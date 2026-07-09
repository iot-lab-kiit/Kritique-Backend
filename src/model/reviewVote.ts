import mongoose, { Schema } from "mongoose";

const reviewVoteSchema = new mongoose.Schema(
  {
    review: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["up", "down"],
      required: true,
    },
  },
  { timestamps: true }
);

reviewVoteSchema.index({ review: 1, user: 1 }, { unique: true });

export default mongoose.model("ReviewVote", reviewVoteSchema);
