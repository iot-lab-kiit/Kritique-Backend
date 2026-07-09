import express from "express";
import {
  createFaculty,
  deleteFaculty,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
} from "../controllers/faculty";
import {
  reactToFaculty,
  removeReaction,
  getFacultyReactions,
} from "../controllers/reaction";
const router = express.Router();

// JSON
router.get("/", getAllFaculty);
// router.post("/", createFaculty);
router.get("/:id", getFacultyById);
// router.put("/:id", updateFaculty);
// router.delete("/:id/", deleteFaculty);

router.post("/:id/reaction", reactToFaculty);
router.delete("/:id/reaction", removeReaction);
router.get("/:id/reactions", getFacultyReactions);

export default router;
