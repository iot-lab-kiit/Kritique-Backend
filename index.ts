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
import reviewRoutes from "./src/routes/review";
import facultyRoutes from "./src/routes/faculty";
import { authToken } from "./src/middleware/auth";

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/src/views"));

app.use(methodOverride("_method"));

app.use(express.json());
app.use(cors(corsOptions));
app.use(compress());
app.use(morgan("dev"));

app.use("/authenticate", userRoutes);
app.use("/reviews", authToken, reviewRoutes);
app.use("/faculties", authToken, facultyRoutes);

app.use((req: Request, res: Response) =>
  res.send("Teacher Review APi. Coded with ❤️ by IoT Web Team.")
);

mongoose
  .connect(mongo)
  .then(() =>
    app.listen(port, () => console.log(`Server is running on port ${port}`))
  )
  .catch((err) => console.log(err));
