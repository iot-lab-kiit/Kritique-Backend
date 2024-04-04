import { Request, Response } from "express";
import Faculty from "../models/faculty.ts";
import Review from "../models/review.ts";
import User from "../models/user.ts";
import { review, reviewParams } from "../@types/review.ts";

export const fetchFacultyReviews = async (req: Request, res: Response) => {
  try {
    const { start, count }: reviewParams = req.body;
    const facultyId = req.query.facultyId as string;
    const faculty = await Faculty.findById(facultyId);

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
    const { id, createdBy, createdFor, rating, feedback }: review = req.body;

    const user = await User.findById(createdBy);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const faculty = await Faculty.findById(createdFor);
    if (!faculty) {
      return res.status(400).json({ message: "Faculty not found" });
    }

    const review = new Review({
      id,
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
    const { id, rating, feedback }: review = req.body;
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
    const { id } = req.body;
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
