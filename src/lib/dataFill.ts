import mongoose from "mongoose";
import fs from "fs";
import csv from "csv-parser";

const facultySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    experience: { type: String },
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
    await mongoose.connect("mongodb://localhost:27017/faculty");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

async function facultyExists(facName) {
  const faculty = await Faculty.findOne({ name: facName.name });
  return faculty;
}
async function insertFacultyFromCSV(csvFilePath) {
  const facultyList = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      if (row.name) {
        facultyList.push({ name: row.name });
      }
    })
    .on("end", async () => {
      console.log(facultyList);
      try {
        for (const facName of facultyList) {
          const exists = await facultyExists(facName);
          if (!exists) {
            await Faculty.create({ name: facName.name });
            console.log(`Inserted: ${facName.name}`);
          } else console.log(`Skipped: ${facName.name}`);
        }
        console.log("Faculty data processing completed");
      } catch (error) {
        console.error("Error inserting faculty data:", error);
      }
    });
}

(async () => {
  await connectToMongoDB();
  const csvFilePath = "./1.csv";
  await insertFacultyFromCSV(csvFilePath);
})();
