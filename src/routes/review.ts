import express from "express";
import { Request, Response } from "express";
import { review, reviewQuery } from "../@types/review";
import {
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
  updateAFaculty,
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
    const newReview = await createNewReview(
      createdBy,
      createdFor,
      rating,
      feedback
    );

    let newrating = newReview.rating;
    let total = faculty.totalRatings;
    let avgRating = faculty.avgRating;
    let newavg = (avgRating * total + newrating) / (total + 1);

    faculty.avgRating = newavg;
    faculty.reviewList.push(newReview._id);
    faculty.totalRatings = total + 1;
    const updatedFaculty = await updateAFaculty(createdFor, faculty);
    res.status(200).json({
      message: "Review created successfully",
    });
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
    let oldRating = review.rating;
    if (rating) {
      if (rating >= 1.0 && rating <= 5.0) review.rating = rating;
      else
        return res
          .status(400)
          .json({ message: "Rating should be between 1.0 and 5.0" });
    }
    if (feedback) review.feedback = feedback;
    const newReview = await updateAReview(id, review);
    const facId = review.createdFor.toString();
    const faculty = await getFacultyById(facId);
    if (rating) {
      let total = faculty.totalRatings;
      let avg = faculty.avgRating;
      let newavg = (avg * total - oldRating + rating) / total;
      faculty.avgRating = newavg;
    }
    const updatedFaculty = await updateAFaculty(facId, faculty);
    res
      .status(200)
      .json({
        message: "Review Updated Successfully",
      });
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
export default router;
