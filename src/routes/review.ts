import express from "express";
import {
  createReview,
  fetchFacultyReviews,
  getAllReviews,
  deleteReview,
  updateReview,
  renderCreateReview,
  renderUpdateReview,
  renderGetAllReviews,
  renderFacultyReviews
} from "../controllers/review";

const router = express.Router();

router.get("/", getAllReviews);
router.post("/", createReview);
router.get("/:facultyId", fetchFacultyReviews);
router.put("/:reviewId", updateReview);
router.delete("/:id", deleteReview);

router.get('/all',renderGetAllReviews);
router.get('/create',renderCreateReview);
router.get("/:id/faculty", renderFacultyReviews);
router.get("/:id/update", renderUpdateReview);

export default router;
