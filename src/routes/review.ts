import express from "express";
import {
  createReview,
  fetchFacultyReviews,
  getAllReviews,
  deleteReview,
  updateReview,
} from "../controllers/review";

const router = express.Router();

router.get("/", getAllReviews);
router.get("/:facultyId", fetchFacultyReviews);
router.post("/", createReview);
router.put("/:reviewId", updateReview);
router.delete("/:id", deleteReview);
export default router;
