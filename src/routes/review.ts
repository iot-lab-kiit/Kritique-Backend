import express from "express";
import { Request, Response } from "express";
import { review, reviewQuery } from "../@types/review";
import {
  createReview,
  fetchFacultyReviews,
  getAllReviews,
  deleteReview,
  updateReview,
  renderCreateReview,
  renderUpdateReview,
  renderGetAllReviews,
  renderFacultyReviews,
  getAllReview,
  getReviewById,
  getFacultyById,
  getTotalReviewByFacultyId,
  getUserById,
  getReviewByFacultyId,
  createNewReview,
  updateAReview,
  deleteAReview,
} from "../controllers/review";
import { messaging } from "firebase-admin";

const router = express.Router();

router.get("/all", renderGetAllReviews);
router.get("/create", renderCreateReview);
router.get("/:id/faculty", renderFacultyReviews);
router.get("/:id/update", renderUpdateReview);

router.get("/", async (req: Request, res: Response) => {
  try {
    const reviews = await getAllReview();
    res.json({ reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.post("/", async (req: Request, res: Response) => {
  try {
    const { createdBy, createdFor, rating, feedback }: review = req.body;
    const user = await getUserById(createdBy);
    if (!user) return res.status(404).json({ message: "User not found" });
    const faculty = await getFacultyById(createdFor);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    let newReview
    if (typeof rating === "number" && typeof feedback === "string") {
      newReview = await createNewReview(
        createdBy,
        createdFor,
        rating,
        feedback
      );
    }else{
      res.status(401).json({ message: "Please provide a valid rating or Feedback" });
    }
    res.status(200).json({ message: "Review created successfully", newReview });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating review" });
  }
});
router.get("/:facultyId", async (req: Request, res: Response) => {
  try {
    const { start, count } = req.query as unknown as reviewQuery;
    const facultyId = req.params.facultyId;
    const faculty = await getFacultyById(facultyId);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    const totalCount = await getTotalReviewByFacultyId(facultyId);
    if (totalCount === 0)
      return res.status(200).json({ message: "No reviews found" });
    let reviews = await getReviewByFacultyId(facultyId, start, count);
    res.json({ faculty, reviews: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.put("/:reviewId", async (req: Request, res: Response) => {
  try {
    const id = req.params.reviewId;
    const { rating, feedback }: review = req.body;
    if (!id || (!rating && !feedback))
      return res
        .status(400)
        .json({ message: "ID or Rating or feedback is required" });
    const review = await getReviewById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (rating) {
      if (rating >= 1.0 && rating <= 5.0) review.rating = rating;
      else
        return res
          .status(400)
          .json({ message: "Rating should be between 1.0 and 5.0" });
    }
    if (feedback) review.feedback = feedback;
    const newReview = await updateAReview(id, review);
    res.status(200).json({ message: "Review Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Id is required" });
    const review = await getReviewById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    await deleteAReview(id);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting review" });
  }
});

// router.get("/", getAllReviews);
// router.post("/", createReview);
// router.get("/:facultyId", fetchFacultyReviews);
// router.put("/:reviewId", updateReview);
// router.delete("/:id", deleteReview);

export default router;
