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
router.get('/allReviews',renderGetAllReviews);

router.get('/create',renderCreateReview);
router.post("/", createReview);

router.get("/:facultyId", fetchFacultyReviews);
router.get("/:id/facultyReview", renderFacultyReviews);

router.get("/:id/update", renderUpdateReview);
router.put("/:reviewId", updateReview);

router.delete("/:id", deleteReview);
export default router;
