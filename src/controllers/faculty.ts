import { Request, Response } from "express";
import FacultyModel from "../model/faculty";
export const getFacultyList = async (req: Request, res: Response) => {
  try {
    const facultyList = await FacultyModel.find();
    res.status(200).json(facultyList);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

export const getFacultyByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const faculty = await FacultyModel.findOne({ name });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.status(200).json(faculty);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

export const getFacultyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const faculty = await FacultyModel.findById(id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.status(200).json(faculty);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

export const updateFaculty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, experience, photoUrl } = req.body;
    const faculty = await FacultyModel.findById(id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    faculty.name = name;
    faculty.experience = experience;
    faculty.photoUrl = photoUrl;
    await faculty.save();
    res.status(200).json({ message: "Faculty updated successfully", faculty });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

export const deleteFaculty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const faculty = await FacultyModel.findById(id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    await faculty.deleteOne();
    res.status(200).json({ message: "Faculty deleted successfully" });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

export const createFaculty = async (req: Request, res: Response) => {
  try {
    const { name, experience, photoUrl } = req.body;
    const faculty = new FacultyModel({ name, experience, photoUrl });
    await faculty.save();
    res.status(201).json({ message: "Faculty created successfully", faculty });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};
