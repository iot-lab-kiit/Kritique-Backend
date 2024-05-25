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

const router = express.Router();

router.get("/all", renderGetAllReviews);
router.get("/create", renderCreateReview);
router.get("/:id/faculty", renderFacultyReviews);
router.get("/:id/update", renderUpdateReview);

router.get("/", async (req: Request, res: Response) => {
  try {
    const { limit, skip, createdBy } = req.query as unknown as reviewQuery;
    const reviews = await getAllReview(limit, skip, createdBy);
    res.json(reviews);
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
      user.id,
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
    res.status(200).json(newReview.toJSON());
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating review" });
  }
});
router.get("/:facultyId", async (req: Request, res: Response) => {
  try {
    const { limit, skip } = req.query as unknown as reviewQuery;
    const facultyId = req.params.facultyId;
    const faculty = await getFacultyById(facultyId);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    const totalCount = await getTotalReviewByFacultyId(facultyId);
    faculty.totalRatings = totalCount;
    let reviews = await getReviewByFacultyId(facultyId, limit, skip);
    if (reviews) {
      faculty.reviewList = reviews.map((review) => review._id);
      await faculty.populate({
        path: "reviewList",
        populate: {
          path: "createdBy",
        },
        select: ["-createdFor"],
      });
    }

    res.json(faculty.toJSON());
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
    console.log(review);
    const facId = review.createdFor.toString();
    console.log(facId);
    const faculty = await getFacultyById(facId);
    if (rating) {
      let total = faculty.totalRatings;
      let avg = faculty.avgRating;
      let newavg = (avg * total - oldRating + rating) / total;
      faculty.avgRating = newavg;
    }
    const updatedFaculty = await updateAFaculty(facId, faculty);
    res.status(200).json({
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
    //Get the faculty for which the review is being created and remove it from the list
    //And Update the faculty
    const faculty = await getFacultyById(review.createdFor.toString());
    faculty.reviewList = faculty.reviewList.filter(
      (reviewId) => reviewId.toString() !== id
    );
    let totalRatings = faculty.totalRatings;
    let avgRating = faculty.avgRating;
    if (totalRatings == 1) {
      faculty.avgRating = 0;
      faculty.totalRatings = 0;
    } else {
      let newAvg =
        (totalRatings * avgRating - review.rating) / (totalRatings - 1);
      faculty.avgRating = newAvg;
      faculty.totalRatings = totalRatings - 1;
    }
    await updateAFaculty(faculty._id.toString(), faculty);
    await deleteAReview(id);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting review" });
  }
});
export default router;
