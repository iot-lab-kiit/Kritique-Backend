import { Request, Response } from "express";
import FacultyModel from "../model/faculty";
import Review from "../model/review";
import UserModel from "../model/user";
import { review, reviewQuery } from "../@types/review";

// TODO : Validated Status
export const fetchFacultyReviews = async (req: Request, res: Response) => {
  try {
    const { start, count } = req.query as unknown as reviewQuery;
    const facultyId = req.params.facultyId;
    const faculty = await FacultyModel.findById(facultyId);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    const totalCount = await Review.countDocuments({
      createdFor: facultyId,
    });

    if (totalCount === 0)
      return res.status(200).json({ message: "No reviews found" });

    let reviews;

    reviews = await Review.find({ createdFor: facultyId })
      .skip(start - 1 ? start - 1 : 0)
      .limit(count ? count : 20);

    res.json({ faculty, reviews: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { createdBy, createdFor, rating, feedback }: review = req.body;

    const user = await UserModel.findById(createdBy);
    if (!user) return res.status(404).json({ message: "User not found" });

    const faculty = await FacultyModel.findById(createdFor);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    const review = new Review({
      createdBy,
      createdFor,
      rating,
      feedback,
    });
    await review.save();
    res.status(200).json({ message: "Review created successfully", review });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating review" });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const id = req.params.reviewId;
    const { rating, feedback }: review = req.body;
    if (!id || (!rating && !feedback))
      return res
        .status(400)
        .json({ message: "ID or Rating or feedback is required" });
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (rating) {
      if (rating >= 1.0 && rating <= 5.0) review.rating = rating;
      else
        return res
          .status(400)
          .json({ message: "Rating should be between 1.0 and 5.0" });
    }

    if (feedback) review.feedback = feedback;

    await review.save();
    res.status(200).json({ message: "Review updated successfully", review });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating review" });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Id is required" });
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await review.deleteOne();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting review" });
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find();
    res.json({ reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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
