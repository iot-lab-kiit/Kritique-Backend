import express from "express";
import {
  createReview,
  deleteReview,
  getAllReview,
  updateReview,
  getFacultyReviewById,
  renderCreateReview,
  renderFacultyReviews,
  renderGetAllReviews,
  renderUpdateReview,
  getUserHistory,
} from "../controllers/review";
const router = express.Router();

// HTML
// router.get("/all", renderGetAllReviews);
// router.get("/create", renderCreateReview);
// router.get("/:id/faculty", renderFacultyReviews);
// router.get("/:id/update", renderUpdateReview);

// JSON
// router.get("/", getAllReview);
// router.post("/", createReview);
// router.get("/:facultyId", getFacultyReviewById);
// router.put("/:reviewId", updateReview);
// router.delete("/:id", deleteReview);
// router.get("/:id/history", getUserHistory);

export default router;
