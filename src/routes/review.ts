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
router.get("/:facultyid/:count/:start", fetchFacultyReviews);
router.post("/", createReview);
router.put("/:reviewId", updateReview);
router.delete("/", deleteReview);
export default router;
