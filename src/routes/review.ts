import express from "express";
import {
  createReview,
  fetchFacultyReviews,
  getAllReviews,
  deleteReview,
  updateReview,
} from "../controllers/review";
import { validateToken } from "../middlewares/auth";
const router = express.Router();

router.get("/", getAllReviews);
router.get("/:facultyid", fetchFacultyReviews);
router.post("/", validateToken, createReview);
router.put("/:reviewId", validateToken, updateReview);
router.delete("/", validateToken, deleteReview);
export default router;
