import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import compress from "compression";
import morgan from "morgan";

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

app.use((req: Request, res: Response) => res.send("Hello World"));

mongoose
  .connect(mongo)
  .then(() =>
    app.listen(port, () => console.log(`Server is running on port ${port}`))
  )
  .catch((err) => console.log(err));
