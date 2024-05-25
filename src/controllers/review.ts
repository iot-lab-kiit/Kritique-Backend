import { Request, Response } from "express";
import FacultyModel from "../model/faculty";
import Review from "../model/review";
import UserModel from "../model/user";
import { review, reviewQuery } from "../@types/review";

export const getAllReview = async (
  limit: number = 20,
  skip: number = 0,
  createdBy: string | undefined = undefined
) => {
  const review = await Review.find({
    createdBy: createdBy ? createdBy : { $exists: true },
  })
    .limit(limit)
    .skip(skip)
    .select("-createdFor")
    .populate(["createdBy"])
    .sort({ createdAt: -1 });
  if (!review) {
    throw new Error("Review not found");
  }
  return review;
};

export const getReviewById = async (id: string) => {
  if (!id) {
    throw new Error("Please provide a valid Id");
  }
  const review = await Review.findById(id);
  if (!review) {
    throw new Error("Review not found by given Id");
  }
  return review;
};

export const getUserById = async (id: string) => {
  if (!id) {
    throw new Error("Please provide a valid Id");
  }
  const user = await UserModel.findOne({ uid: id });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};
export const getFacultyById = async (id: string) => {
  if (!id) {
    throw new Error("Please provide a valid Id");
  }
  const user = await FacultyModel.findById(id);
  if (!user) {
    throw new Error("Faculty not found");
  }
  return user;
};

export const getReviewByFacultyId = async (
  id: string,
  limit: number = 20,
  skip: number = 0
) => {
  if (!id) {
    throw new Error("Please provide a valid Id");
  }
  const reviews = await Review.find({ createdFor: id })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return reviews;
};

export const getTotalReviewByFacultyId = async (id: string) => {
  if (!id) {
    throw new Error("Please provide a valid Id");
  }
  const totalCount = await Review.countDocuments({ createdFor: id });
  return totalCount;
};

export const createNewReview = async (
  createdBy: string,
  createdFor: string,
  rating: number,
  feedback: string
) => {
  if (!createdBy || !createdFor || !feedback || !rating) {
    throw new Error("Please Provide a valid details");
  }
  const newReview = new Review({
    createdBy,
    createdFor,
    rating,
    feedback,
  });
  await newReview.save();
  return newReview;
};

export const updateAReview = async (id: string, review: any) => {
  if (!id) {
    throw new Error("Please provide the correct id");
  }
  const newReview = await Review.findByIdAndUpdate(
    id,
    {
      rating: review.rating,
      feedback: review.feedback,
    },
    {
      timestamps: true,
    }
  );
  return newReview;
};

export const deleteAReview = async (id: string) => {
  if (!id) {
    throw new Error("Please provide the valid Id");
  }
  await Review.findByIdAndDelete(id);
};

export const updateAFaculty = async (id: string, faculty: any) => {
  if (!id) {
    throw new Error("Please provide a valid id");
  }
  const updatedFaculty = await FacultyModel.findByIdAndUpdate(
    id,
    {
      avgRating: faculty.avgRating,
      totalRatings: faculty.totalRatings,
      reviewList: faculty.reviewList,
    },
    { returnOriginal: false }
  );
  return updatedFaculty;
};

// render Controller Function
export const renderCreateReview = async (req: Request, res: Response) => {
  res.render("review/createReview");
};

export const renderUpdateReview = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({ message: "Review not found" });
    }
    res.render("review/updateReview", { review });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const renderGetAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find();
    if (!reviews) {
      res.status(404).json({ message: "Review not found" });
    }
    res.render("review/reviewList", { reviews });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const renderFacultyReviews = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const reviews = await Review.find({ createdFor: id });
    if (!reviews) {
      res.status(404).json({ message: "Review not found" });
    }
    res.render("review/reviewList", { reviews });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
