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
    // Get All the review Created by the User
    const AllReviews= await ReviewModel.find({createdBy:userRecord?._id})
    // Traverse through the AllReview and Delete it
    for (const review of AllReviews){
      await deleteReview(review?._id.toString())
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

export const deleteReview = async (id: string): Promise<void> => {
  try {
    if (!id) {
      throw new Error("Invalid Id");
    }

    const review = await ReviewModel.findById(id);
    if (!review) {
      throw new Error("Review not found");
    }

    const faculty = await FacultyModel.findById(review.createdFor.toString());
    if (!faculty) {
      throw new Error("Faculty not found");
    }

    faculty.reviewList = faculty.reviewList.filter((r) => r.toString() !== id);

    let totalRatings = faculty.totalRatings;
    let avgRating = faculty.avgRating;

    if (totalRatings == 1) {
      faculty.avgRating = 0;
      faculty.totalRatings = 0;
    } else {
      let newAvg = ((totalRatings * avgRating) - review.rating) / (totalRatings - 1);
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

    await ReviewModel.findByIdAndDelete(id);
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
};
