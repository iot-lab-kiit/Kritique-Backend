import express from "express";
import {getFaculty, getFacultyById, updateFaculty, renderDeleteForm, deleteFaculty, deleteAll, createFaculty, renderCreateForm, renderUpdateForm} from "../controllers/faculty";
const router = express.Router();

router.get("/create", renderCreateForm);
router.post("/", createFaculty);
router.get("/:id/update", renderUpdateForm);
router.put("/:id", updateFaculty);
router.get("/:id/delete", renderDeleteForm);
router.get("/deleteAll", deleteAll);
router.delete("/:id", deleteFaculty);
router.get("/:id", getFacultyById);
router.get("/", getFaculty);
export default router;
