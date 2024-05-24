import { Request, Response } from "express";
import { firebaseAuth } from "../lib/firebase-admin";
import UserModel from "../model/user";
import { UserQuery } from "../@types/user";

export const authorizeUser = async (req: Request, res: Response) => {
  try {
    const { access_token, role }: UserQuery = req.body;
    if (!access_token) return res.status(400).send("Token is required");
    const user = await firebaseAuth.verifyIdToken(access_token);
    const record = await firebaseAuth.getUser(user.uid);
    const email = record.providerData[0].email;
    const userRecord = await UserModel.findOneAndUpdate(
      { uid: user.uid },
      { name: user.name },
      { new: true }
    );
    // user found
    if (userRecord) return res.send(userRecord);

    // user not found -> create new user
    const newUser = new UserModel({
      uid: user.uid,
      email,
      photoUrl: user.picture,
      role: role || "user",
      name: user.name,
    });
    await newUser.save();
    return res.send(newUser);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const token = req.body.token;
    if (!token) return res.sendStatus(400);
    const user = await firebaseAuth.verifyIdToken(token);
    const record = await firebaseAuth.getUser(user.uid);
    const userRecord = await UserModel.findOneAndDelete({ uid: user.uid });
    firebaseAuth.deleteUser(user.uid);
    if (userRecord) return res.send(userRecord);
    return res.send("User not found");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};
