import express from "express";
import {getFaculty, getFacultyById, updateFaculty, renderDeleteForm, deleteFaculty, deleteAll, createFaculty, renderCreateForm, renderUpdateForm, viewFaculty} from "../controllers/faculty";
const router = express.Router();

router.get("/create", renderCreateForm);
router.get("/:id/update", renderUpdateForm);
router.get("/:id/delete", renderDeleteForm);
router.get("/view", viewFaculty);

router.post("/", createFaculty);
router.put("/:id", updateFaculty);
router.get("/deleteAll", deleteAll);
router.delete("/:id", deleteFaculty);
router.get("/:id", getFacultyById);
router.get("/", getFaculty);
export default router;
