import {Request, Response} from "express";
import FacultyModel from "../model/faculty";
import {Faculty} from "../@types/faculty";

export const getFaculty = async (req: Request, res: Response) => {
    try {
        const facultyList = await FacultyModel.find();
        if (!facultyList) return res.status(404).json({message: "No records found !"});

        const name = req.query.name as string;
        if (name) {
            const faculty = await FacultyModel.find({name});
            if (!faculty) return res.status(404).json({message: "No records found with name !"});

            res.status(200).json(faculty);
        } else {
            res.status(200).json(facultyList);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
};

export const viewFaculty = async (req: Request, res: Response) => {
    try {
        const facultyList = await FacultyModel.find();
        if (!facultyList) {
            return res.status(404).json({message: "No records found !"});
        }
        res.status(200).render("Faculty/facultyList", {list: facultyList});
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
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

export const deleteAll = async (req: Request, res: Response) => {
    try {
        await FacultyModel.deleteMany({});
        res.status(200).json({message: "All faculties deleted successfully"});
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
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
