import axios from "axios";
import mongoose from "mongoose";
import { config } from "dotenv";

config();

const facultySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    experience: { type: Number, default: 0 },
    photoUrl: { type: String },
    avgRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    reviewList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);
const Faculty = mongoose.model("Faculty", facultySchema);

async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

async function insertFaculty(url: string) {
  const { data } = await axios.get(url);
  for (let i = 0; i < data.length; i++) {
    try {
      await Faculty.create([
        { name: data[i].A },
        { name: data[i].B },
        { name: data[i].C },
        { name: data[i].D },
        { name: data[i].E },
        { name: data[i].F },
        { name: data[i].G },
        { name: data[i].H },
        { name: data[i].I },
      ]);
    } catch (err: any) {
      console.error(err.message);
    }
  }
}

(async () => {
  await connectToMongoDB();
  const url =
    "https://opensheet.elk.sh/1XiN_TvpeXqhMrrl_tP0cGQ9s9e530wSbzbAxUideJMg/Teacher";
  await insertFaculty(url);
  console.log("Done");
  process.exit(0);
})();
