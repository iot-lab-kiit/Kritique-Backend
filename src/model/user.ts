import mongoose from "mongoose";
const { Schema } = mongoose;

interface User {
  uid: string;
  name: string;
  email?: string | null;
  photoUrl?: string | null;
  role?: "admin" | "user";
}

const UserSchema = new Schema<User>(
  {
    uid: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, default: null },
    photoUrl: { type: String, default: null },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
