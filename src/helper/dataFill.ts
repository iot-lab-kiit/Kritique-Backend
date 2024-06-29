import axios from "axios";
import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    experience: { type: Number, default: 0 },
    photoUrl: { type: String, default: "" },
    avgRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    reviewList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);
const Faculty = mongoose.model("Faculty", facultySchema);

async function connectToMongoDB() {
  try {
    await mongoose.connect(" ");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

async function insertFaculty(url: string) {
  const { data } = await axios.get(url);
  for (let i = 0; i < data.length; i++) {
    try {
      await Faculty.create([{ name: data[i].Name, photoUrl: data[i].Image }]);
    } catch (err: any) {
      console.error(err.message);
    }
  }
}

(async () => {
  await connectToMongoDB();
  const url =
    "https://opensheet.elk.sh/1zlF9WLhkZdOiBCqm0kLatbbu1cu8qjfcMC8cldE9mvo/Sheet1";
  await insertFaculty(url);
  console.log("Done");
  process.exit(0);
})();
