import express from "express";
import {
  getFacultyList,
  getFacultyById,
  getFacultyByName,
  updateFaculty,
  deleteFaculty,
  createFaculty,
} from "../controllers/faculty";
const router = express.Router();

router.get("/", getFacultyList);
router.get("/:id", getFacultyById);
router.get("/:name", getFacultyByName);
router.post("/", createFaculty);
router.put("/:id", updateFaculty);
router.delete("/", deleteFaculty);
export default router;
