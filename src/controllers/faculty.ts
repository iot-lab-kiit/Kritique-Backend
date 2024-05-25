import { Request, Response } from "express";
import FacultyModel from "../model/faculty";

export const getAllFaculty = async (req: Request, res: Response) => {
  try {
    const { limit, skip } = req.query;
    const faculties = await FacultyModel.find()
      .select("-reviewList")
      .limit(limit ? parseInt(limit as string, 10) : 10)
      .skip(skip ? parseInt(skip as string, 10) : 0);

    res.status(200).json(faculties);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

export const createFaculty = async (req: Request, res: Response) => {
  try {
    const { name, experience, photoUrl } = req.body;
    if (!name || !experience || !photoUrl)
      return res
        .status(400)
        .json({ message: "Name, experience, and photoUrl are required" });

    const faculty = new FacultyModel({ name, experience, photoUrl });
    await faculty.save();

    res.status(201).json({ message: "Faculty created successfully", faculty });
  } catch (e: any) {
    console.error(e);
    res.status(500).send({ message: e.message });
  }
};

export const getFacultyById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || id === ":id")
      return res.status(400).json({ message: "Id is required" });

    const faculty = await FacultyModel.findById(id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    res.status(200).json(faculty);
  } catch (e: any) {
    console.error(e);
    res.status(500).send({ message: e.message });
  }
};

export const updateFaculty = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || id === ":id")
      return res.status(400).json({ message: "Id is required" });

    const { name, experience, photoUrl } = req.body;
    if (!name || !experience || !photoUrl)
      return res
        .status(400)
        .json({ message: "Name, experience, and photoUrl are required" });

    const faculty = await FacultyModel.findById(id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    const facultyData = await FacultyModel.findByIdAndUpdate(
      id,
      { name, experience, photoUrl },
      { new: true }
    );
    if (!facultyData)
      return res.status(404).json({ message: "Faculty not found" });

    res.status(200).json({ message: "Faculty updated successfully", faculty });
  } catch (e: any) {
    console.error(e);
    res.status(500).send({ message: e.message });
  }
};

export const deleteFaculty = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || id === ":id")
      return res.status(400).json({ message: "Id is required" });

    const faculty = await FacultyModel.findById(id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    await FacultyModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Faculty deleted successfully" });
  } catch (e: any) {
    console.error(e);
    res.status(500).send({ message: e.message });
  }
};

export const renderGetAllFaculties = async (req: Request, res: Response) => {
  try {
    const faculties = await FacultyModel.find().select("-reviewList");
    if (!faculties)
      return res.status(404).json({ message: "Faculty list not found" });

    res.status(200).render("Faculty/facultyList", { list: faculties });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

export const renderCreateFaculty = async (req: Request, res: Response) => {
  res.render("Faculty/facultyForm");
};

export const renderGetFacultyById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || id === ":id")
      return res.status(400).json({ message: "Id is required" });

    const faculty = await FacultyModel.findById(id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    res.status(200).render("Faculty/facultyDetails", { faculty });
  } catch (e: any) {
    console.error(e);
    res.status(500).send({ message: e.message });
  }
};

export const renderUpdateFaculty = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || id === ":id")
      return res.status(400).json({ message: "Id is required" });

    const faculty = await FacultyModel.findById(id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    res.render("Faculty/updateForm", { faculty });
  } catch (e: any) {
    console.error(e);
    res.status(500).send({ message: e.message });
  }
};

export const renderDeleteFaculty = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || id === ":id")
      return res.status(400).json({ message: "Id is required" });

    const faculty = await FacultyModel.findById(id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    res.render("Faculty/deleteForm", { faculty });
  } catch (e: any) {
    console.error(e);
    res.status(500).send({ message: e.message });
  }
};
