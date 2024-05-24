import mongoose from "mongoose";
import { User } from "../@types/user";

const UserSchema = new mongoose.Schema<User>(
  {
    uid: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, default: null },
    photoUrl: { type: String, default: null },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    status: { type: Boolean, default: false }, // false : not verified, true : verified
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
