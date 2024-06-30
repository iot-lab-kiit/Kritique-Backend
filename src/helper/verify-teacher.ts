import axios from "axios";
import mongoose from "mongoose";

async function connectToMongoDB() {
  try {
    await mongoose.connect("");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

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

async function verifyTeacher(url: string) {
  try {
    const { data } = await axios.get(url);
    const teachers = await Faculty.find().select("name");
    const teacherNames = teachers.map((teacher) => teacher.name.toLowerCase());

    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      for (const [key, value] of Object.entries(entry)) {
        let teacherName = value as string;
        let arr = teacherName.split(" ");
        arr.shift();
        teacherName = arr.join(" ");
        if (!teacherNames.includes(teacherName.toLowerCase())) {
          console.log(
            `Teacher: ${teacherName} in ${key} of entry ${entry.CSE} is not found in MongoDB`
          );
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}

async function addFaculty(data: string[]) {
  try {
    for (let i = 0; i < data.length; i++) {
      const teacherName = data[i];
      const teacher = new Faculty({ name: teacherName, experience: null });
      await teacher.save();
      console.log(`Teacher: ${teacherName} added to MongoDB`);
    }
  } catch (e) {
    console.error(e);
  }
}

// (async () => {
//   await connectToMongoDB();
//   const url =
//     "https://opensheet.elk.sh/1OhztlJqGuTwQTy-bHtbaPJHBLddn9jtQD9NC3Z9otro/5th%20Sem";
//   //   await verifyTeacher(url);
//   //   await addFaculty(data);
//   console.log("Done");
//   process.exit(0);
// })();
