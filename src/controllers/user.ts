import UserModel from "../model/user";
import { UserQuery } from "../@types/user";
import { Request, Response } from "express";
import { firebaseAuth } from "../lib/firebase-admin";

export const authorizeUser = async (req: Request, res: Response) => {
  try {
    const { token, role }: UserQuery = req.body;
    if (!token) return res.status(400).send("Token is required");
    const user = await firebaseAuth.verifyIdToken(token);
    const record = await firebaseAuth.getUser(user.uid);
    const email = record.providerData[0].email;
    const userRecord = await UserModel.findOneAndUpdate(
      { uid: user.uid },
      { name: user.name },
      { new: true }
    );
    if (userRecord) return res.send(userRecord);

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
    const uid = req.params.id;
    if (!uid) return res.sendStatus(400);
    const userRecord = await UserModel.findOneAndDelete({ uid: uid });
    if (userRecord) {
      firebaseAuth.deleteUser(uid);
      return res.json({ message: "User deleted" });
    }
    return res.send({ message: "User not found" });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};
