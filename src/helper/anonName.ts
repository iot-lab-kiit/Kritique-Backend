import { randomName } from "../lib/random-names";
import UserModel from "../model/user";
import mongoose from "mongoose";

export const addAnonName = async () => {
  try {
    const userr = await UserModel.find({}).select("_id");
    await Promise.all(
      userr.map(async (user) => {
        await UserModel.findByIdAndUpdate(user._id, {
          anon_name: randomName(),
        });
      })
    );
  } catch (e) {
    console.error(e);
  }
};

async function connectToMongoDB() {
  try {
    await mongoose.connect("");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

async function SwitchNameAnon() {
  try {
    const userr = await UserModel.find({}).select("_id name anon_name");
    await Promise.all(
      userr.map(async (user) => {
        await UserModel.findByIdAndUpdate(user._id, {
          name: user.anon_name,
          anon_name: user.name,
        });
      })
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

(async () => {
  await connectToMongoDB();
  // await addAnonName();
  // await SwitchNameAnon();
  console.log("Done");
  process.exit(0);
})();
