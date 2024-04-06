import { Request, Response } from "express";
import FacultyModel from "../model/faculty";
import Review from "../model/review";
import UserModel from "../model/user";
import { review, reviewParams } from "../@types/review";

export const fetchFacultyReviews = async (req: Request, res: Response) => {
  try {
    const { facultyId, start, count }: reviewParams =
      req.query as unknown as reviewParams;
    const faculty = await FacultyModel.findById(facultyId);

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const totalCount = await Review.countDocuments({
      createdFor: facultyId,
    });

    if (totalCount === 0) {
      return res.status(200).json({ message: "No reviews found" });
    }

    let reviews;
    if (count) {
      reviews = await Review.find({ createdFor: facultyId })
        .skip(start)
        .limit(count)
        .populate("createdFor");
    } else {
      reviews = await Review.find({ createdFor: facultyId })
        .skip(start)
        .limit(20)
        .populate("createdFor");
    }

    res.json({
      faculty,
      reviews: reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { createdBy, createdFor, rating, feedback }: review = req.body;

    const user = await UserModel.findById(createdBy);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const faculty = await FacultyModel.findById(createdFor);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const review = new Review({
      createdBy,
      createdFor,
      rating,
      feedback,
      status: "validated",
    });

    await review.save();

    res.status(200).json({ message: "Review created successfully", review });
  } catch (error) {
    res.status(500).json({ message: "Error creating review", error });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const id = req.params.reviewId;
    const { rating, feedback }: review = req.body;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    if (rating) {
      if (rating >= 1.0 && rating <= 5.0) {
        review.rating = rating;
      } else
        res
          .status(400)
          .json({ message: "Rating should be between 1.0 and 5.0" });
    }

    if (feedback) {
      review.feedback = feedback;
    }
    await review.save();
    res.status(200).json({ message: "Review updated successfully", review });
  } catch (error) {
    res.status(500).json({ message: "Error updating review", error });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    await review.deleteOne();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error });
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
