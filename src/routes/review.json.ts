import express from "express";
import {
  createReview,
  deleteReview,
  getAllReview,
  updateReview,
  getFacultyReviewById,
  getUserHistory,
} from "../controllers/review";
const router = express.Router();

// JSON
router.get("/", getAllReview);
router.post("/", createReview);
router.get("/:facultyId", getFacultyReviewById);
router.put("/:reviewId", updateReview);
router.delete("/:id", deleteReview);
router.get("/:id/history", getUserHistory);

export default router;
