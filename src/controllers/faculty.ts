import {Request, Response} from "express";
import FacultyModel from "../model/faculty";
import {Faculty} from "../@types/faculty";

export const getFaculty = async (req: Request, res: Response) => {
    try {
        const facultyList = await FacultyModel.find().select("-reviewList")
        if (!facultyList) return res.status(404).json({message: "No records found !"});

        const name = req.query.name as string;
        if (name) {
            const faculty = await FacultyModel.find({name});
            if (!faculty) return res.status(404).json({message: "No records found with name !"});

            res.status(200).json(faculty);
            res.json(200).render("Faculty/facultyList", {list: faculty});
        } else {
            //res.status(200).render("Faculty/facultyList", {list: facultyList});
            res.status(200).json(facultyList);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
};
export const getFacultyById = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        console.log(id);
        if (!id || id === ":id") return res.status(400).json({message: "Id is required"});
        const faculty = await FacultyModel.findById(id);
        if (!faculty) return res.status(404).json({message: "Faculty not found"});
        // res.status(200).render("Faculty/facultyDetails", {faculty});
        res.status(200).json(faculty)
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
};

export const renderUpdateForm = async (req: Request, res: Response) => {
    const id = req.params.id;
    const faculty = await FacultyModel.findById(id);
    if (!faculty) {
        return res.status(404).json({message: "Faculty not found"});
    }

    res.render("Faculty/updateForm", {faculty});
};

export const updateFaculty = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {name, experience, photoUrl}: Faculty = req.body;
        if (!name || !experience || !photoUrl) return res.status(400).json({message: "Name, experience, and photoUrl are required"});
        const faculty = await FacultyModel.findById(id);
        if (!faculty) return res.status(404).json({message: "Faculty not found"});
        faculty.name = name;
        faculty.experience = experience;
        faculty.photoUrl = photoUrl;
        await faculty.save();
        res.status(200).json({message: "Faculty updated successfully", faculty});
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
};

export const renderDeleteForm = async (req: Request, res: Response) => {
    const id = req.params.id;
    const faculty = await FacultyModel.findById(id);
    if (!faculty) {
        return res.status(404).json({message: "Faculty not found"});
    }

    res.render("Faculty/deleteForm", {faculty});
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

export const deleteFaculty = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        if (!id) return res.status(400).json({message: "Id is required"});
        const faculty = await FacultyModel.findById(id);
        if (!faculty) return res.status(404).json({message: "Faculty not found"});
        await faculty.deleteOne();
        res.status(200).json({message: "Faculty deleted successfully"});
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
};

export const renderCreateForm = async (req: Request, res: Response) => {
    res.render("Faculty/facultyForm");
};

export const createFaculty = async (req: Request, res: Response) => {
    try {
        const {name, experience, photoUrl}: Faculty = req.body;
        if (!name || !experience || !photoUrl) {
            res.status(400).json({message: "Name, experience, and photoUrl are required"});
            return;
        }
        const faculty = new FacultyModel({name, experience, photoUrl});
        await faculty.save();
        console.log(faculty);
        res.status(201).json({message: "Faculty created successfully", faculty});
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
};
