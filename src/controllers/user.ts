import UserModel from "../model/user";
import { UserQuery } from "../@types/user";
import { Request, Response } from "express";
import { firebaseAuth } from "../lib/firebase-admin";
import { createResponse } from "../../response";
import {
  CREATED,
  DELETED,
  EMAIL_NOT_ALLOWED,
  INTERNAL_SERVER_ERROR,
  INVALID_REQUEST,
  SUCCESSFUL,
  TOKEN_REQUIRED,
  USER_NOT_FOUND,
} from "../constants/statusCode";
import ReviewModel from "../model/review";
import FacultyModel from "../model/faculty";
import dotenv from "dotenv";
import { randomName } from "../lib/random-names";

dotenv.config();

export const authorizeUser = async (req: Request, res: Response) => {
  try {
    const { token, role }: UserQuery = req.body;
    if (!token) return res.send(createResponse(TOKEN_REQUIRED, null));
    const user = await firebaseAuth.verifyIdToken(token.split(" ")[1]);
    const record = await firebaseAuth.getUser(user.uid);
    const email = record.providerData[0].email;

    if (
      !email.endsWith("@kiit.ac.in") &&
      process.env.ALLOW_KIIT_ONLY === "true"
    )
      return res.send(createResponse(EMAIL_NOT_ALLOWED, null));
    const userRecord = await UserModel.findOne({ uid: user.uid });
    // const userRecord = await UserModel.findOne(
    //   { uid: user.uid },
    //   { name: user.name },
    //   { new: true }
    // );
    if (userRecord) return res.send(createResponse(SUCCESSFUL, userRecord));

    const newUser = new UserModel({
      uid: user.uid,
      email,
      photoUrl: user.picture,
      role: role || "user",
      name: user.name,
      anon_name: randomName(),
    });
    await newUser.save();
    return res.send(createResponse(CREATED, newUser));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, null));
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const uid = req.params.id;
    if (!uid) return res.send(createResponse(INVALID_REQUEST, null));
    const userRecord = await UserModel.findOneAndDelete({ uid: uid });
    const userHistory = await ReviewModel.find({ createdBy: userRecord?._id });
    if (userHistory.length > 0) {
      for (let i = 0; i < userHistory.length; i++) {
        const faculty = await FacultyModel.findById(
          userHistory[i].createdFor.toString()
        );
        if (!faculty) continue;

        faculty.reviewList = faculty.reviewList.filter(
          (r) => r.toString() !== userHistory[i].createdFor.toString()
        );
        let totalRatings = faculty.totalRatings;
        let avgRating = faculty.avgRating;

        if (totalRatings == 1) {
          faculty.avgRating = 0;
          faculty.totalRatings = 0;
        } else {
          let newAvg =
            (totalRatings * avgRating - userHistory[i].rating) /
            (totalRatings - 1);
          faculty.avgRating = newAvg;
          faculty.totalRatings = totalRatings - 1;
        }

        await FacultyModel.findByIdAndUpdate(
          faculty._id,
          {
            avgRating: faculty.avgRating,
            totalRatings: faculty.totalRatings,
            reviewList: faculty.reviewList,
          },
          { returnOriginal: false }
        );

        await ReviewModel.findByIdAndDelete(userHistory[i]._id);
      }
    }

    if (userRecord) {
      firebaseAuth.deleteUser(uid);
      return res.send(createResponse(DELETED, {}));
    }
    return res.send(createResponse(USER_NOT_FOUND, null));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, null));
  }
};
