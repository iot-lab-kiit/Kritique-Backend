import express from "express";
import {
  getFaculty,
  getFacultyById,
  findFaculty,
  updateFaculty,
  deleteFaculty,
  deleteAll,
  createFaculty,
  viewFaculty,
} from "../controllers/faculty";
import faculty from "../model/faculty";
const router = express.Router();

//View all faculty
router.get("/view", viewFaculty);

//Create new faculty
router.get("/create", async (req, res) => {
  res.render("Faculty/facultyForm");
});

//Render update form
router.get("/:id/update", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || id === ":id") {
      return res.status(400).json({ message: "Id is required" });
    }
    const facultyData = await findFaculty(id);
    if (!facultyData) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    const faculty = facultyData.faculty;
    res.render("Faculty/updateForm", { faculty });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

//Render delete form
router.get("/:id/delete", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || id === ":id") {
      return res.status(400).json({ message: "Id is required" });
    }
    const facultyData = await findFaculty(id);
    if (!facultyData) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    const faculty = facultyData.faculty;
    res.render("Faculty/deleteForm", { faculty });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

//Get faculty by id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || id === ":id") {
      return res.status(400).json({ message: "Id is required" });
    }

    const facultyData = await findFaculty(id);
    const faculty = facultyData.faculty;
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.status(200).render("Faculty/facultyDetails", { faculty });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

//POST request to create faculty
router.post("/", async (req, res) => {
  try {
    const { name, experience, photoUrl } = req.body;

    if (!name || !experience || !photoUrl) {
      return res
        .status(400)
        .json({ message: "Name, experience, and photoUrl are required" });
    }
    const faculty = await createFaculty(experience, name, photoUrl);

    res.status(201).json({ message: "Faculty created successfully", faculty });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

//PUT request to update faculty
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || id === ":id") {
      return res.status(400).json({ message: "Id is required" });
    }

    const { name, experience, photoUrl } = req.body;
    if (!name || !experience || !photoUrl) {
      return res
        .status(400)
        .json({ message: "Name, experience, and photoUrl are required" });
    }
    const facultyData = await updateFaculty(id, name, photoUrl, experience);
    if (!facultyData) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    const faculty = facultyData.faculty;
    res.status(200).json({ message: "Faculty updated successfully", faculty });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// DELETE THIS FUNCTION AFTER TESTING
router.get("/deleteAll", deleteAll);

//DELETE request to delete faculty
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      return res.status(400).json({ message: "Id is required" });
    }
    const faculty = await deleteFaculty(id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.status(200).json({ message: "Faculty deleted successfully", faculty });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

//GET request to get all faculty
router.get("/", getFaculty);

export default router;
