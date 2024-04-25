import express from "express";
import {
  getFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  createFaculty,
} from "../controllers/faculty";
const router = express.Router();

router.get("/", getFaculty);
router.get("/:id", getFacultyById);
router.post("/", createFaculty);
router.put("/:id", updateFaculty);
router.delete("/:id", deleteFaculty);
export default router;
