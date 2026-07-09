import mongoose, { Schema } from "mongoose";

const facultyReactionSchema = new mongoose.Schema(
  {
    faculty: {
      type: Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  { timestamps: true }
);

facultyReactionSchema.index({ faculty: 1, user: 1 }, { unique: true });

export default mongoose.model("FacultyReaction", facultyReactionSchema);
