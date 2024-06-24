import express from "express";
import {
  renderCreateFaculty,
  renderDeleteFaculty,
  renderGetAllFaculties,
  renderGetFacultyById,
  renderUpdateFaculty,
} from "../controllers/faculty";
const router = express.Router();

// HTML
router.get("/", renderGetAllFaculties);
router.get("/:id", renderGetFacultyById);
// router.get("/create", renderCreateFaculty);
// router.get("/update/:id", renderUpdateFaculty);
// router.get("/delete/:id", renderDeleteFaculty);

export default router;
