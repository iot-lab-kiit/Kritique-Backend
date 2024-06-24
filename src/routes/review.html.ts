import express from "express";
import {
  renderCreateReview,
  renderFacultyReviews,
  renderGetAllReviews,
  renderUpdateReview,
} from "../controllers/review";
const router = express.Router();

// HTML
router.get("/", renderGetAllReviews);
router.get("/:id/", renderFacultyReviews);
// router.get("/create", renderCreateReview);
// router.get("/update/:id", renderUpdateReview);

export default router;
