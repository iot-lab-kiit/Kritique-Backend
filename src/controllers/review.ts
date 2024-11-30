import UserModel from "../model/user";
import ReviewModel from "../model/review";
import { Request, Response } from "express";
import FacultyModel from "../model/faculty";
import { review, reviewQuery } from "../@types/review";
import { createResponse } from "../../response";
import {
  ALREADY_REVIEWED,
  CREATED,
  DELETED,
  FACULTY_NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  INVALID_REQUEST,
  PROFANITY_DETECTED,
  REVIEW_NOT_FOUND,
  SUCCESSFUL,
  UPDATED,
  USER_NOT_FOUND,
} from "../constants/statusCode";
// import { isProfane } from "../lib/profanity";
import { NewRequest } from "../@types/express";

export const getUserHistory = async (req: Request, res: Response) => {
  try {
    const { limit, page } = req.query as unknown as reviewQuery;
    const id = req.params.id;
    if (!id) return res.send(createResponse(INVALID_REQUEST, null));
    const user = await UserModel.findOne({ uid: id }).select("_id");
    if (!user) return res.send(createResponse(USER_NOT_FOUND, null));

    const reviews = await ReviewModel.find({ createdBy: user?._id })
      .sort({ updatedAt: -1 })
      .populate({
        path: "createdFor",
        select:
          "-createdAt -updatedAt -__v -reviewList -avgRating -totalRatings",
      })
      .limit(limit ? limit : 10)
      .skip(page ? page * (limit ? limit : 10) : 0)
      .select("-updatedAt -__v -status -createdBy");
    if (reviews.length === 0 && page == 0)
      return res.send(createResponse(REVIEW_NOT_FOUND, null));

    return res.send(createResponse(SUCCESSFUL, reviews));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, null));
  }
};

export const getAllReview = async (req: Request, res: Response) => {
  try {
    const { limit, page, createdBy } = req.query as unknown as reviewQuery;
    const reviews = await ReviewModel.find({
      createdBy: createdBy ? createdBy : { $exists: true },
    })
      .limit(limit ? limit : 10)
      .skip(page ? page * (limit ? limit : 10) : 0)
      .select("-createdFor")
      .populate({
        path: "createdBy",
        select: "-createdAt -updatedAt -__v -role -status",
      })
      .sort({ createdAt: -1 })
      .select("-updatedAt -__v -status");
    if (reviews.length === 0 && page == 0)
      return res.send(createResponse(REVIEW_NOT_FOUND, null));

    res.send(createResponse(SUCCESSFUL, reviews));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, null));
  }
};

export const createReview = async (req: NewRequest, res: Response) => {
  try {
    const { createdFor, rating, feedback }: review = req.body;
    if (!createdFor || !rating || !feedback)
      return res.send(createResponse(INVALID_REQUEST, null));
    // if (isProfane(feedback))
    //   return res.send(createResponse(PROFANITY_DETECTED, null));

    if (!req.user) return res.send(createResponse(USER_NOT_FOUND, null));
    const user = await UserModel.findOne({ uid: req.user.uid });
    if (!user) return res.send(createResponse(USER_NOT_FOUND, null));

    const faculty = await FacultyModel.findById(createdFor);
    if (!faculty) return res.send(createResponse(FACULTY_NOT_FOUND, null));

    for (const reviewId of faculty.reviewList) {
      const review = await ReviewModel.findById(reviewId);
      if (review && review.createdBy.equals(user._id))
        return res.send(createResponse(ALREADY_REVIEWED, null));
    }

    const newReview = new ReviewModel({
      createdBy: user._id,
      createdFor,
      rating,
      feedback,
    });
    await newReview.save();

    let newrating = newReview.rating;
    let total = faculty.totalRatings;
    let avgRating = faculty.avgRating;
    let newavg = (avgRating * total + newrating) / (total + 1);

    faculty.avgRating = newavg;
    faculty.reviewList.push(newReview._id);
    faculty.totalRatings = total + 1;

    const updatedFaculty = await FacultyModel.findByIdAndUpdate(
      createdFor,
      {
        avgRating: faculty.avgRating,
        totalRatings: faculty.totalRatings,
        reviewList: faculty.reviewList,
      },
      { returnOriginal: false }
    );
    if (!updatedFaculty)
      return res.send(createResponse(FACULTY_NOT_FOUND, null));

    res.send(createResponse(CREATED, newReview));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, null));
  }
};

export const getFacultyReviewById = async (req: Request, res: Response) => {
  try {
    const { limit, page } = req.query as unknown as reviewQuery;
    const facultyId = req.params.facultyId;

    if (!facultyId) return res.send(createResponse(INVALID_REQUEST, null));

    const faculty = await FacultyModel.findById(facultyId);
    if (!faculty) return res.send(createResponse(FACULTY_NOT_FOUND, null));

    const totalCount = await ReviewModel.countDocuments({
      createdFor: facultyId,
    });
    faculty.totalRatings = totalCount;

    const reviews = await ReviewModel.find({ createdFor: facultyId })
      .limit(limit ? limit : 10)
      .skip(page ? page * (limit ? limit : 10) : 0)
      .sort({ createdAt: -1 });

    if (reviews.length === 0 && page == 0)
      return res.send(createResponse(REVIEW_NOT_FOUND, null));

    if (reviews) {
      faculty.reviewList = reviews.map((r) => r._id);
      await faculty.populate({
        path: "reviewList",
        populate: {
          path: "createdBy",
          select: "-role -updatedAt -createdAt -__v -status",
        },
        select: "-createdFor -updatedAt -__v -status",
      });
    }
    if (faculty.reviewList.length === 0 && page == 0)
      return res.send(createResponse(REVIEW_NOT_FOUND, null));

    res.send(createResponse(SUCCESSFUL, faculty.reviewList));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, null));
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const id = req.params.reviewId;
    const { rating, feedback }: review = req.body;
    if (!id || (!rating && !feedback))
      return res.send(createResponse(INVALID_REQUEST, null));

    const review = await ReviewModel.findById(id);
    if (!review) return res.send(createResponse(REVIEW_NOT_FOUND, null));

    let oldRating = review.rating;
    if (rating) {
      if (rating >= 1.0 && rating <= 5.0) review.rating = rating;
      else return res.send(createResponse(INVALID_REQUEST, null));
    }

    if (feedback) review.feedback = feedback;
    const newReview = await ReviewModel.findByIdAndUpdate(
      id,
      { rating: review.rating, feedback: review.feedback },
      { timestamps: true }
    );

    const facId = review.createdFor.toString();
    const faculty = await FacultyModel.findById(facId);
    if (!faculty) return res.send(createResponse(FACULTY_NOT_FOUND, null));

    if (rating) {
      let total = faculty.totalRatings;
      let avg = faculty.avgRating;
      let newavg = (avg * total - oldRating + rating) / total;
      faculty.avgRating = newavg;
    }

    const updatedFaculty = await FacultyModel.findByIdAndUpdate(
      facId,
      {
        avgRating: faculty.avgRating,
        totalRatings: faculty.totalRatings,
        reviewList: faculty.reviewList,
      },
      { new: true }
    );

    res.send(createResponse(UPDATED, newReview));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, null));
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.send(createResponse(INVALID_REQUEST, null));

    const review = await ReviewModel.findById(id);
    if (!review) return res.send(createResponse(REVIEW_NOT_FOUND, null));

    // Get the faculty for which the review is being created and remove it from the list. And Update the faculty
    const faculty = await FacultyModel.findById(review.createdFor.toString());
    if (!faculty) return res.send(createResponse(FACULTY_NOT_FOUND, null));

    faculty.reviewList = faculty.reviewList.filter((r) => r.toString() !== id);

    let totalRatings = faculty.totalRatings;
    let avgRating = faculty.avgRating;

    if (totalRatings == 1) {
      faculty.avgRating = 0;
      faculty.totalRatings = 0;
    } else {
      let newAvg =
        (totalRatings * avgRating - review.rating) / (totalRatings - 1);
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

    res.send(createResponse(DELETED, {}));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, null));
  }
};

export const renderGetAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await ReviewModel.find();
    if (!reviews) res.json({ message: "Review not found" });
    res.render("review/reviewList", { reviews });
  } catch (e: any) {
    console.log(e);
    res.json({ message: e.message });
  }
};

export const renderCreateReview = async (req: Request, res: Response) => {
  try {
    res.render("review/createReview");
  } catch (e: any) {
    console.error(e);
    res.json({ message: e.message });
  }
};

export const renderUpdateReview = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;
    if (!reviewId) res.json({ message: "Please provide a valid id" });

    const review = await ReviewModel.findById(reviewId);
    if (!review) res.json({ message: "Review not found" });

    res.render("review/updateReview", { review });
  } catch (e: any) {
    console.log(e);
    res.json({ message: e.message });
  }
};

export const renderFacultyReviews = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const reviews = await ReviewModel.find({ createdFor: id });
    if (!reviews) res.json({ message: "Review not found" });

    res.render("review/reviewList", { reviews });
  } catch (e: any) {
    console.log(e);
    res.json({ message: e.message });
  }
};
