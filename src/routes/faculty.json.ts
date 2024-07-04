import express from "express";
import {
  createFaculty,
  deleteFaculty,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
} from "../controllers/faculty";
const router = express.Router();

// JSON
router.get("/", getAllFaculty);
// router.post("/", createFaculty);
router.get("/:id", getFacultyById);
// router.put("/:id", updateFaculty);
// router.delete("/:id/", deleteFaculty);

export default router;
