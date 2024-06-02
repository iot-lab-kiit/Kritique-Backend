import express from "express";
import {
  createFaculty,
  deleteFaculty,
  getAllFaculty,
  getFacultyById,
  renderCreateFaculty,
  renderDeleteFaculty,
  renderGetAllFaculties,
  renderGetFacultyById,
  renderUpdateFaculty,
  updateFaculty,
} from "../controllers/faculty";
const router = express.Router();

// HTML
router.get("/view", renderGetAllFaculties);
router.get("/view/:id", renderGetFacultyById);
router.get("/create", renderCreateFaculty);
router.get("/update/:id", renderUpdateFaculty);
router.get("/delete/:id", renderDeleteFaculty);

// JSON
router.get("/", getAllFaculty);
router.post("/", createFaculty);
router.get("/:id", getFacultyById);
router.put("/:id", updateFaculty);
router.delete("/:id/", deleteFaculty);

export default router;
