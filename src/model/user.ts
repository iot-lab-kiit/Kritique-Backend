import mongoose from "mongoose";
import { User } from "../@types/user";

const UserSchema = new mongoose.Schema<User>(
  {
    uid: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, default: null },
    photoUrl: { type: String, default: null },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
