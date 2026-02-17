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
 * Get User Waitlist
 */
export const getWaitList = async (req: NewRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.send(createResponse(INVALID_REQUEST, null));
    }

    const user = await UserModel.findOne(
      { uid: req.user.uid },
      { waitList: 1 } // only fetch waitList field
    );

    if (!user) {
      return res.send(createResponse(USER_NOT_FOUND, null));
    }

    return res.send(
      createResponse(SUCCESSFUL, user.waitList || [])
    );
  } catch (error: any) {
    console.error("getWaitList error:", error);
    return res.send(createResponse(INVALID_REQUEST, null));
  }
};

/**
 * Add Item To Waitlist
 */
export const addToWaitList = async (req: NewRequest, res: Response) => {
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
      { $addToSet: { waitList: fic } }, // prevents duplicates
      { new: true }
    );

    if (!updated) {
      return res.send(createResponse(USER_NOT_FOUND, null));
    }

    return res.send(
      createResponse(CREATED, { message: "Added to waitlist" })
    );
  } catch (error: any) {
    console.error("addToWaitList error:", error);
    return res.send(createResponse(INVALID_REQUEST, null));
  }
};

/**
 * Remove Item From Waitlist
 */
export const removeFromWaitList = async (req: NewRequest, res: Response) => {
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
      { $pull: { waitList: fic } }, // removes matching value
      { new: true }
    );

    if (!updated) {
      return res.send(createResponse(USER_NOT_FOUND, null));
    }

    return res.send(
      createResponse(SUCCESSFUL, updated.waitList)
    );
  } catch (error: any) {
    console.error("removeFromWaitList error:", error);
    return res.send(createResponse(INVALID_REQUEST, null));
  }
};
