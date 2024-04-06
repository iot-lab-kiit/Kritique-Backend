import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import compress from "compression";
import morgan from "morgan";
import reviewRoutes from "./src/routes/review.ts";
dotenv.config();
const app = express();
const port = process.env.PORT || 3300;
const mongo =
  process.env.MONGO_URI || "mongodb://localhost:27017/teacher-review";
const corsOptions = { origin: "*", optionssuccessStatus: 200 };

app.use(express.json());
app.use(cors(corsOptions));
app.use(compress());
app.use(morgan("dev"));

app.use((req: Request, res: Response) =>
  res.send("This is Faculty Review API")
);
app.use("/reviews", reviewRoutes);
mongoose
  .connect(mongo)
  .then(() =>
    app.listen(port, () => console.log(`Server is running on port ${port}`))
  )
  .catch((err) => console.log(err));
