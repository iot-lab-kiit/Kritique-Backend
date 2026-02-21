import UserModel from "../model/user";
import { Response } from "express";
import { createResponse } from "../../response";
import {
  CREATED,
  INVALID_REQUEST,
  SUCCESSFUL,
  USER_NOT_FOUND,
} from "../constants/statusCode";
import { NewRequest } from "../@types/express";

/**
 * Get User bookmarks
 */
export const getBookmark = async (req: NewRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.send(createResponse(INVALID_REQUEST, null));
    }

    const user = await UserModel.findOne(
      { uid: req.user.uid },
      { bookmark: 1 }, // only fetch bookmark field
    );

    if (!user) {
      return res.send(createResponse(USER_NOT_FOUND, null));
    }

    return res.send(createResponse(SUCCESSFUL, user.bookmark || []));
  } catch (error: any) {
    console.error("getBookmark error:", error);
    return res.send(createResponse(INVALID_REQUEST, null));
  }
};

/**
 * Add Item To Waitlist
 */
export const addToBookmark = async (req: NewRequest, res: Response) => {
  try {
    const { fic } = req.body;

    if (!fic) {
      return res.send(createResponse(INVALID_REQUEST, null));
    }

    if (!req.user?.uid) {
      return res.send(createResponse(USER_NOT_FOUND, null));
    }

    const updated = await UserModel.findOneAndUpdate(
      { uid: req.user.uid },
      { $addToSet: { bookmark: fic } }, // prevents duplicates
      { new: true },
    );

    if (!updated) {
      return res.send(createResponse(USER_NOT_FOUND, null));
    }

    return res.send(createResponse(CREATED, { message: "Added to waitlist" }));
  } catch (error: any) {
    console.error("addToBookmark error:", error);
    return res.send(createResponse(INVALID_REQUEST, null));
  }
};

/**
 * Remove Item From Waitlist
 */
export const removeFromBookmark = async (req: NewRequest, res: Response) => {
  try {
    const { fic } = req.body;

    if (!fic) {
      return res.send(createResponse(INVALID_REQUEST, null));
    }

    if (!req.user?.uid) {
      return res.send(createResponse(INVALID_REQUEST, null));
    }

    const updated = await UserModel.findOneAndUpdate(
      { uid: req.user.uid },
      { $pull: { bookmark: fic } }, // removes matching value
      { new: true },
    );

    if (!updated) {
      return res.send(createResponse(USER_NOT_FOUND, null));
    }

    return res.send(createResponse(SUCCESSFUL, updated.bookmark));
  } catch (error: any) {
    console.error("removeFromBookmark error:", error);
    return res.send(createResponse(INVALID_REQUEST, null));
  }
};
