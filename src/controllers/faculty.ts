import {Request, Response} from "express";
import FacultyModel from "../model/faculty";
import {Faculty} from "../@types/faculty";

export const getFaculty = async (limit: number = 5, skip: number = 0) => {
    const faculties = await FacultyModel.find().select("-reviewList").limit(limit).skip(skip);
    if (!faculties) {
        throw new Error("Faculty list not found");
    }
    return faculties;
};

export const viewFaculty = async (limit: number = 5, skip: number = 0) => {
    const faculties = await FacultyModel.find().limit(limit).skip(skip);
    if (!faculties) {
        throw new Error("Faculty list not found");
    }
    return faculties;
};

export const renderUpdateForm = async (req: Request, res: Response) => {
    const id = req.params.id;
    const faculty = await FacultyModel.findById(id);
    if (!faculty) {
        return res.status(404).json({message: "Faculty not found"});
    }

    res.render("Faculty/updateForm", {faculty});
};

export const getFacultyById = async (id: String) => {
    try {
        const faculty = await FacultyModel.findById(id);
        if (!faculty) {
            return {status: 404, message: "Faculty not found"};
        } else {
            return {status: 200, faculty};
        }
    } catch (err) {
        console.log(err);
        return {status: 500, message: "Internal Server Error"};
    }
};

export const findFaculty = async (id: String) => {
    try {
        const faculty = await FacultyModel.findById(id);
        if (!faculty) {
            return {status: 404, message: "Faculty not found"};
        } else {
            return {status: 200, faculty};
        }
    } catch (err) {
        console.log(err);
        return {status: 500, message: "Internal Server Error"};
    }
};

export const updateFaculty = async (id: String, updatedName?: String, updatedPhotoUrl?: String, updatedExperience?: string) => {
    try {
        const faculty = await FacultyModel.findById(id);
        if (!faculty) {
            return {status: 404, message: "Faculty not found"};
        }
        faculty.name = updatedName ? String(updatedName) : "";
        faculty.experience = updatedExperience ? String(updatedExperience) : "";
        faculty.photoUrl = updatedPhotoUrl ? String(updatedPhotoUrl) : null;

        await faculty.save();
        return {status: 200, faculty};
    } catch (err) {
        console.log(err);
        return {status: 500, message: "Internal Server Error"};
    }
};

export const renderCreateForm = async (req: Request, res: Response) => {
    res.render("Faculty/facultyForm");
};

export const deleteFaculty = async (id: String) => {
    try {
        const faculty = await FacultyModel.findById(id);
        if (!faculty) {
            return {status: 404, message: "Faculty not found"};
        }
        await faculty.deleteOne();
        return {status: 200, faculty};
    } catch (err) {
        console.log(err);
        return {status: 500, message: "Internal Server Error"};
    }
};

export const createFaculty = async (experience: Number, name?: String, photoUrl?: String) => {
    try {
        const faculty = new FacultyModel({name, experience, photoUrl});
        await faculty.save();

        console.log(faculty);

        return {status: 201, faculty};
    } catch (err) {
        console.log(err);
        return {status: 500, message: "Internal Server Error"};
    }
};
