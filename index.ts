import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
import compress from "compression";
import methodOverride from "method-override";
import express, { Request, Response } from "express";

dotenv.config();
const app = express();
const port = process.env.PORT || 3300;
const mongo =
  process.env.MONGO_URI || "mongodb://localhost:27017/teacher-review";
const corsOptions = { origin: "*", optionssuccessStatus: 200 };

import userRoutes from "./src/routes/user";
import waitListRoutes from "./src/routes/waitlist";
import reviewJSONRoutes from "./src/routes/review.json";
import facultyJSONRoutes from "./src/routes/faculty.json";
import facultyHTMLRoutes from "./src/routes/faculty.html";
import reviewHTMLRoutes from "./src/routes/review.html";
import { authToken } from "./src/middleware/auth";

app.use(compress());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors(corsOptions));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "/src/views"));

app.use("/authenticate", userRoutes);
app.use("/reviews", authToken, reviewJSONRoutes);
app.use("/faculties", authToken, facultyJSONRoutes);

app.use("/review", reviewHTMLRoutes);
app.use("/faculty", facultyHTMLRoutes);

app.use("/waitlist", authToken, waitListRoutes);

app.use((req: Request, res: Response) =>
  res.send({ message: "Teacher Review APi. Coded with ❤️ by IoT Web Team." })
);

mongoose
  .connect(mongo)
  .then(() =>
    app.listen(port, () => console.log(`Server is running on port ${port}`))
  )
  .catch((err) => console.log(err));
