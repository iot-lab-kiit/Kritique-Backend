import UserModel from "../model/user";
import ReviewModel from "../model/review";
import { Request, Response } from "express";
import FacultyModel from "../model/faculty";
import { review, reviewQuery } from "../@types/review";

export const getAllReview = async (req: Request, res: Response) => {
  try {
    const { limit, skip, createdBy } = req.query as unknown as reviewQuery;
    const reviews = await ReviewModel.find({
      createdBy: createdBy ? createdBy : { $exists: true },
    })
      .limit(limit ? limit : 10)
      .skip(skip ? skip : 0)
      .select("-createdFor")
      .populate(["createdBy"])
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { createdBy, createdFor, rating, feedback }: review = req.body;
    if (!createdBy || !createdFor || !rating || !feedback)
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });

    const user = await UserModel.findOne({ uid: createdBy }).select("id");
    if (!user) return res.status(404).json({ message: "User not found" });

    const faculty = await FacultyModel.findById(createdFor);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

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
    let newavg = (avgRating * total + newrating) / (total + 1); // FIXME

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

    res.status(200).json(newReview);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

export const getFacultyReviewById = async (req: Request, res: Response) => {
  try {
    const { limit, skip } = req.query as unknown as reviewQuery;
    const facultyId = req.params.facultyId;

    if (!facultyId)
      return res
        .status(400)
        .json({ message: "Please provide a valid faculty id" });

    const faculty = await FacultyModel.findById(facultyId);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    const totalCount = await ReviewModel.countDocuments({
      createdFor: facultyId,
    });
    faculty.totalRatings = totalCount;

    const reviews = await ReviewModel.find({ createdFor: facultyId })
      .skip(skip ? skip : 0)
      .limit(limit ? limit : 10)
      .sort({ createdAt: -1 });

    if (!reviews) return res.status(404).json({ message: "Review not found" });

    if (reviews) {
      faculty.reviewList = reviews.map((r) => r._id);
      await faculty.populate({
        path: "reviewList",
        populate: { path: "createdBy" },
        select: ["-createdFor"],
      });
    }

    res.json(faculty);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: e.message });
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

    const review = await ReviewModel.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    let oldRating = review.rating;
    if (rating) {
      if (rating >= 1.0 && rating <= 5.0) review.rating = rating;
      else
        return res
          .status(400)
          .json({ message: "Rating should be between 1.0 and 5.0" });
    }

    if (feedback) review.feedback = feedback;
    const newReview = await ReviewModel.findByIdAndUpdate(
      id,
      { rating: review.rating, feedback: review.feedback },
      { timestamps: true }
    );

    const facId = review.createdFor.toString();
    const faculty = await FacultyModel.findById(facId);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

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

    res.status(200).json({
      message: "Review Updated Successfully",
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Id is required" });

    const review = await ReviewModel.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Get the faculty for which the review is being created and remove it from the list. And Update the faculty
    const faculty = await FacultyModel.findById(review.createdFor.toString());
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

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

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (e: any) {
    console.log(e);
    res.status(500).json({ message: e.meesage });
  }
};

export const renderGetAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await ReviewModel.find();
    if (!reviews) res.status(404).json({ message: "Review not found" });
    res.render("review/reviewList", { reviews });
  } catch (e: any) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
};

export const renderCreateReview = async (req: Request, res: Response) => {
  res.render("review/createReview");
};

export const renderUpdateReview = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;
    if (!reviewId)
      res.status(400).json({ message: "Please provide a valid id" });

    const review = await ReviewModel.findById(reviewId);
    if (!review) res.status(404).json({ message: "Review not found" });

    res.render("review/updateReview", { review });
  } catch (e: any) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
};

export const renderFacultyReviews = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const reviews = await ReviewModel.find({ createdFor: id });
    if (!reviews) res.status(404).json({ message: "Review not found" });

    res.render("review/reviewList", { reviews });
  } catch (e: any) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
};
