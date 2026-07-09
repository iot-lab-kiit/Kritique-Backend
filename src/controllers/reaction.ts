import FacultyModel from "../model/faculty";
import FacultyReactionModel from "../model/facultyReaction";
import UserModel from "../model/user";
import { Response } from "express";
import { createResponse } from "../../response";
import {
  ALREADY_REACTED,
  CREATED,
  FACULTY_NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  INVALID_REQUEST,
  REACTION_NOT_FOUND,
  REACTION_REMOVED,
  SUCCESSFUL,
  USER_NOT_FOUND,
} from "../constants/statusCode";
import { NewRequest } from "../@types/express";

export const reactToFaculty = async (req: NewRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!id || !type || !["like", "dislike"].includes(type))
      return res.send(createResponse(INVALID_REQUEST, null));

    if (!req.user) return res.send(createResponse(USER_NOT_FOUND, null));
    const user = await UserModel.findOne({ uid: req.user.uid });
    if (!user) return res.send(createResponse(USER_NOT_FOUND, null));

    const faculty = await FacultyModel.findById(id);
    if (!faculty) return res.send(createResponse(FACULTY_NOT_FOUND, null));

    const existingReaction = await FacultyReactionModel.findOne({
      faculty: id,
      user: user._id,
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        return res.send(createResponse(ALREADY_REACTED, existingReaction));
      }

      const oldType = existingReaction.type;
      existingReaction.type = type;
      await existingReaction.save();

      if (oldType === "like") {
        await FacultyModel.findByIdAndUpdate(id, { $inc: { likes: -1 } });
      } else {
        await FacultyModel.findByIdAndUpdate(id, { $inc: { dislikes: -1 } });
      }

      if (type === "like") {
        await FacultyModel.findByIdAndUpdate(id, { $inc: { likes: 1 } });
      } else {
        await FacultyModel.findByIdAndUpdate(id, { $inc: { dislikes: 1 } });
      }

      return res.send(createResponse(ALREADY_REACTED, existingReaction));
    }

    const reaction = new FacultyReactionModel({
      faculty: id,
      user: user._id,
      type,
    });
    await reaction.save();

    if (type === "like") {
      await FacultyModel.findByIdAndUpdate(id, { $inc: { likes: 1 } });
    } else {
      await FacultyModel.findByIdAndUpdate(id, { $inc: { dislikes: 1 } });
    }

    return res.send(createResponse(CREATED, reaction));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, null));
  }
};

export const removeReaction = async (req: NewRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) return res.send(createResponse(INVALID_REQUEST, null));

    if (!req.user) return res.send(createResponse(USER_NOT_FOUND, null));
    const user = await UserModel.findOne({ uid: req.user.uid });
    if (!user) return res.send(createResponse(USER_NOT_FOUND, null));

    const reaction = await FacultyReactionModel.findOneAndDelete({
      faculty: id,
      user: user._id,
    });

    if (!reaction) return res.send(createResponse(REACTION_NOT_FOUND, null));

    if (reaction.type === "like") {
      await FacultyModel.findByIdAndUpdate(id, { $inc: { likes: -1 } });
    } else {
      await FacultyModel.findByIdAndUpdate(id, { $inc: { dislikes: -1 } });
    }

    return res.send(createResponse(REACTION_REMOVED, null));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, null));
  }
};

export const getFacultyReactions = async (req: NewRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) return res.send(createResponse(INVALID_REQUEST, null));

    const faculty = await FacultyModel.findById(id);
    if (!faculty) return res.send(createResponse(FACULTY_NOT_FOUND, null));

    let myReaction = null;
    if (req.user) {
      const user = await UserModel.findOne({ uid: req.user.uid });
      if (user) {
        const reaction = await FacultyReactionModel.findOne({
          faculty: id,
          user: user._id,
        });
        myReaction = reaction ? reaction.type : null;
      }
    }

    return res.send(
      createResponse(SUCCESSFUL, {
        likes: faculty.likes,
        dislikes: faculty.dislikes,
        myReaction,
      })
    );
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, null));
  }
};
