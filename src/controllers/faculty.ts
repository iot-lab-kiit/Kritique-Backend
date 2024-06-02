import { Request, Response } from "express";
import FacultyModel from "../model/faculty";
import { facultyQuery } from "../@types/faculty";
import { createResponse } from "../../response";
import {
  CREATED,
  DELETED,
  FACULTY_NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  INVALID_REQUEST,
  SUCCESSFUL,
  UPDATED,
} from "../constants/statusCode";

export const getAllFaculty = async (req: Request, res: Response) => {
  try {
    const { limit, page, name } = req.query as unknown as facultyQuery;

    if (name) {
      const faculties = await FacultyModel.find({
        name: { $regex: name.trim() as string, $options: "i" },
      })
        .select("-reviewList")
        .limit(limit ? limit : 10)
        .skip(page ? page * (limit ? limit : 10) : 0);

      if (faculties.length === 0 && page == 0)
        return res.send(
          createResponse(FACULTY_NOT_FOUND, "Faculty not found", null)
        );

      return res.send(
        createResponse(SUCCESSFUL, "Faculties fetched successfully", faculties)
      );
    }

    const faculties = await FacultyModel.find()
      .select("-reviewList")
      .limit(limit ? limit : 10)
      .skip(page ? page * (limit ? limit : 10) : 0);
    if (page == 0 && faculties.length === 0)
      return res.send(
        createResponse(FACULTY_NOT_FOUND, "Faculty not found", null)
      );

    res.send(
      createResponse(SUCCESSFUL, "Faculties fetched successfully", faculties)
    );
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, error.message, null));
  }
};

export const createFaculty = async (req: Request, res: Response) => {
  try {
    const { name, experience, photoUrl } = req.body;
    if (!name || !experience || !photoUrl)
      return res.send(
        createResponse(
          INVALID_REQUEST,
          "Name, experience, and photoUrl are required",
          null
        )
      );

    const faculty = new FacultyModel({ name, experience, photoUrl });
    await faculty.save();

    res.send(createResponse(CREATED, "Faculty created successfully", faculty));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, error.message, null));
  }
};

export const getFacultyById = async (req: Request, res: Response) => {
  try {
    const { limit, page } = req.query as unknown as facultyQuery;
    const id = req.params.id;
    if (!id || id === ":id")
      return res.send(createResponse(INVALID_REQUEST, "Id is required", null));

    const faculty = await FacultyModel.findById(id)
      .limit(limit ? limit : 10)
      .skip(page ? page * (limit ? limit : 10) : 0);
    if (!faculty && page == 0)
      return res.send(
        createResponse(FACULTY_NOT_FOUND, "Faculty not found", null)
      );

    res.send(createResponse(SUCCESSFUL, "Faculty found", faculty));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, error.message, null));
  }
};

export const updateFaculty = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || id === ":id")
      return res.send(createResponse(INVALID_REQUEST, "Id is required", null));

    const { name, experience, photoUrl } = req.body;
    if (!name || !experience || !photoUrl)
      return res.send(
        createResponse(
          INVALID_REQUEST,
          "Name, experience, and photoUrl are required",
          null
        )
      );

    const faculty = await FacultyModel.findById(id);
    if (!faculty)
      return res.send(
        createResponse(FACULTY_NOT_FOUND, "Faculty not found", null)
      );

    const facultyData = await FacultyModel.findByIdAndUpdate(
      id,
      { name, experience, photoUrl },
      { new: true }
    );
    if (!facultyData)
      return res.send(
        createResponse(FACULTY_NOT_FOUND, "Faculty not found", null)
      );

    res.send(
      createResponse(UPDATED, "Faculty updated successfully", facultyData)
    );
  } catch (e: any) {
    console.error(e);
    res.send({ message: e.message });
  }
};

export const deleteFaculty = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || id === ":id")
      return res.send(createResponse(INVALID_REQUEST, "Id is required", null));

    const faculty = await FacultyModel.findById(id);
    if (!faculty)
      return res.send(
        createResponse(FACULTY_NOT_FOUND, "Faculty not found", null)
      );

    await FacultyModel.findByIdAndDelete(id);

    res.send(createResponse(DELETED, "Faculty deleted successfully", {}));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, error.message, null));
  }
};

export const renderGetAllFaculties = async (req: Request, res: Response) => {
  try {
    const faculties = await FacultyModel.find().select("-reviewList");
    if (!faculties) return res.json({ message: "Faculty list not found" });

    res.render("Faculty/facultyList", { list: faculties });
  } catch (e: any) {
    console.error(e);
    res.json({ message: e.message });
  }
};

export const renderCreateFaculty = async (req: Request, res: Response) => {
  try {
    res.render("Faculty/facultyForm");
  } catch (e: any) {
    console.error(e);
    res.json({ message: e.message });
  }
};

export const renderGetFacultyById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || id === ":id") return res.json({ message: "Id is required" });

    const faculty = await FacultyModel.findById(id);
    if (!faculty) return res.json({ message: "Faculty not found" });

    res.render("Faculty/facultyDetails", { faculty });
  } catch (e: any) {
    console.error(e);
    res.send({ message: e.message });
  }
};

export const renderUpdateFaculty = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || id === ":id") return res.json({ message: "Id is required" });

    const faculty = await FacultyModel.findById(id);
    if (!faculty) return res.json({ message: "Faculty not found" });

    res.render("Faculty/updateForm", { faculty });
  } catch (e: any) {
    console.error(e);
    res.send({ message: e.message });
  }
};

export const renderDeleteFaculty = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || id === ":id") return res.json({ message: "Id is required" });

    const faculty = await FacultyModel.findById(id);
    if (!faculty) return res.json({ message: "Faculty not found" });

    res.render("Faculty/deleteForm", { faculty });
  } catch (e: any) {
    console.error(e);
    res.send({ message: e.message });
  }
};
