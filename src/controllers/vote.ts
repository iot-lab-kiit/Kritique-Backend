import ReviewModel from "../model/review";
import ReviewVoteModel from "../model/reviewVote";
import UserModel from "../model/user";
import { Response } from "express";
import { createResponse } from "../../response";
import {
  ALREADY_VOTED,
  CREATED,
  INTERNAL_SERVER_ERROR,
  INVALID_REQUEST,
  REVIEW_NOT_FOUND,
  SUCCESSFUL,
  USER_NOT_FOUND,
  VOTE_NOT_FOUND,
  VOTE_REMOVED,
} from "../constants/statusCode";
import { NewRequest } from "../@types/express";

export const voteReview = async (req: NewRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!id || !type || !["up", "down"].includes(type))
      return res.send(createResponse(INVALID_REQUEST, null));

    if (!req.user) return res.send(createResponse(USER_NOT_FOUND, null));
    const user = await UserModel.findOne({ uid: req.user.uid });
    if (!user) return res.send(createResponse(USER_NOT_FOUND, null));

    const review = await ReviewModel.findById(id);
    if (!review) return res.send(createResponse(REVIEW_NOT_FOUND, null));

    const existingVote = await ReviewVoteModel.findOne({
      review: id,
      user: user._id,
    });

    if (existingVote) {
      if (existingVote.type === type) {
        return res.send(createResponse(ALREADY_VOTED, existingVote));
      }

      const oldType = existingVote.type;
      existingVote.type = type;
      await existingVote.save();

      if (oldType === "up") {
        await ReviewModel.findByIdAndUpdate(id, { $inc: { upvotes: -1 } });
      } else {
        await ReviewModel.findByIdAndUpdate(id, { $inc: { downvotes: -1 } });
      }

      if (type === "up") {
        await ReviewModel.findByIdAndUpdate(id, { $inc: { upvotes: 1 } });
      } else {
        await ReviewModel.findByIdAndUpdate(id, { $inc: { downvotes: 1 } });
      }

      return res.send(createResponse(ALREADY_VOTED, existingVote));
    }

    const vote = new ReviewVoteModel({
      review: id,
      user: user._id,
      type,
    });
    await vote.save();

    if (type === "up") {
      await ReviewModel.findByIdAndUpdate(id, { $inc: { upvotes: 1 } });
    } else {
      await ReviewModel.findByIdAndUpdate(id, { $inc: { downvotes: 1 } });
    }

    return res.send(createResponse(CREATED, vote));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, null));
  }
};

export const removeVote = async (req: NewRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) return res.send(createResponse(INVALID_REQUEST, null));

    if (!req.user) return res.send(createResponse(USER_NOT_FOUND, null));
    const user = await UserModel.findOne({ uid: req.user.uid });
    if (!user) return res.send(createResponse(USER_NOT_FOUND, null));

    const vote = await ReviewVoteModel.findOneAndDelete({
      review: id,
      user: user._id,
    });

    if (!vote) return res.send(createResponse(VOTE_NOT_FOUND, null));

    if (vote.type === "up") {
      await ReviewModel.findByIdAndUpdate(id, { $inc: { upvotes: -1 } });
    } else {
      await ReviewModel.findByIdAndUpdate(id, { $inc: { downvotes: -1 } });
    }

    return res.send(createResponse(VOTE_REMOVED, null));
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, null));
  }
};

export const getReviewVotes = async (req: NewRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) return res.send(createResponse(INVALID_REQUEST, null));

    const review = await ReviewModel.findById(id);
    if (!review) return res.send(createResponse(REVIEW_NOT_FOUND, null));

    let myVote = null;
    if (req.user) {
      const user = await UserModel.findOne({ uid: req.user.uid });
      if (user) {
        const vote = await ReviewVoteModel.findOne({
          review: id,
          user: user._id,
        });
        myVote = vote ? vote.type : null;
      }
    }

    return res.send(
      createResponse(SUCCESSFUL, {
        upvotes: review.upvotes,
        downvotes: review.downvotes,
        myVote,
      })
    );
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, null));
  }
};
