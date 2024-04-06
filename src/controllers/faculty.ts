import { Request, Response } from "express";
import FacultyModel from "../model/faculty";
import { Faculty } from "../@types/faculty";

export const getFacultyList = async (req: Request, res: Response) => {
  try {
    const facultyList = await FacultyModel.find();
    if (!facultyList)
      return res.status(404).json({ message: "Faculty not found" });
    res.status(200).json(facultyList);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

export const getFacultyByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    if (!name) return res.status(400).json({ message: "Name is required" });
    const faculty = await FacultyModel.findOne({ name });
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    res.status(200).json(faculty);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

export const getFacultyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Id is required" });
    const faculty = await FacultyModel.findById(id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    res.status(200).json(faculty);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

export const updateFaculty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, experience, photoUrl }: Faculty = req.body;
    if (!name || !experience || !photoUrl)
      return res
        .status(400)
        .json({ message: "Name, experience, and photoUrl are required" });
    const faculty = await FacultyModel.findById(id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    faculty.name = name;
    faculty.experience = experience;
    faculty.photoUrl = photoUrl;
    await faculty.save();
    res.status(200).json({ message: "Faculty updated successfully", faculty });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

export const deleteFaculty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Id is required" });
    const faculty = await FacultyModel.findById(id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    await faculty.deleteOne();
    res.status(200).json({ message: "Faculty deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

export const createFaculty = async (req: Request, res: Response) => {
  try {
    const { name, experience, photoUrl }: Faculty = req.body;
    if (!name || !experience || !photoUrl)
      return res
        .status(400)
        .json({ message: "Name, experience, and photoUrl are required" });
    const faculty = new FacultyModel({ name, experience, photoUrl });
    await faculty.save();
    res.status(201).json({ message: "Faculty created successfully", faculty });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};
