import UserModel from "../model/user";
import { UserQuery } from "../@types/user";
import { Request, Response } from "express";
import { firebaseAuth } from "../lib/firebase-admin";
import { createResponse } from "../../response";
import ReviewModel from '../model/review'
import FacultyModel from "../model/faculty";
import {
  CREATED,
  DELETED,
  FACULTY_NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  INVALID_REQUEST,
  REVIEW_NOT_FOUND,
  SUCCESSFUL,
  TOKEN_REQUIRED,
  USER_NOT_FOUND,
} from "../constants/statusCode";

export const authorizeUser = async (req: Request, res: Response) => {
  try {
    const { token, role }: UserQuery = req.body;
    if (!token)
      return res.send(createResponse(TOKEN_REQUIRED, "Token required", null));
    const user = await firebaseAuth.verifyIdToken(token.split(" ")[1]);
    const record = await firebaseAuth.getUser(user.uid);
    const email = record.providerData[0].email;
    const userRecord = await UserModel.findOneAndUpdate(
      { uid: user.uid },
      { name: user.name },
      { new: true }
    );
    if (userRecord)
      return res.send(
        createResponse(SUCCESSFUL, "User data found", userRecord)
      );

    const newUser = new UserModel({
      uid: user.uid,
      email,
      photoUrl: user.picture,
      role: role || "user",
      name: user.name,
    });
    await newUser.save();
    return res.send(createResponse(CREATED, "User Created", newUser));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, error.message, null));
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const uid = req.params.id;
    if (!uid)
      return res.send(createResponse(INVALID_REQUEST, "UID is required", null));

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
      return res.send(createResponse(DELETED, "User Deleted", {}));
    }
    return res.send(createResponse(USER_NOT_FOUND, "User not Found", null));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, error.message, null));
  }
};
