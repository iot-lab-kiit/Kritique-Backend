import express from "express";
import {
  createReview,
  deleteReview,
  getAllReview,
  updateReview,
  getFacultyReviewById,
  getUserHistory,
} from "../controllers/review";
import {
  voteReview,
  removeVote,
  getReviewVotes,
} from "../controllers/vote";
const router = express.Router();

// JSON
router.get("/", getAllReview);
router.post("/", createReview);
router.get("/:facultyId", getFacultyReviewById);
router.put("/:reviewId", updateReview);
router.delete("/:id", deleteReview);
router.get("/:id/history", getUserHistory);

router.post("/:id/vote", voteReview);
router.delete("/:id/vote", removeVote);
router.get("/:id/votes", getReviewVotes);

export default router;
