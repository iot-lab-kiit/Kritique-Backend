import dotenv from "dotenv";
import { firebaseAuth } from "../lib/firebase-admin";
import { createResponse } from "../../response";
import {
  EMAIL_NOT_ALLOWED,
  INTERNAL_SERVER_ERROR,
  INVALID_REQUEST,
  INVALID_TOKEN,
  TOKEN_REQUIRED,
  VERSION_MISMATCH,
} from "../constants/statusCode";
import { NextFunction, Response } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import { NewRequest } from "../@types/express";

dotenv.config();

export const authToken = async (
  req: NewRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token;
    if (
      process.env.DISABLE_APP_VERSION === "true" &&
      req.headers.version !== process.env.APP_VERSION
    )
      return res.send(createResponse(VERSION_MISMATCH, null));
    if (process.env.ACCESS_TOKEN_DISABLED === "true") next();
    else {
      if (!req.headers.authorization)
        return res.send(createResponse(TOKEN_REQUIRED, null));
      token = req.headers.authorization.split(" ")[1];
      const user: DecodedIdToken = await firebaseAuth.verifyIdToken(token);
      if (user) {
        req.user = user;
        if (process.env.ALLOW_KIIT_ONLY === "true") {
          if (
            user.email?.split("@")[1] === "kiit.ac.in" &&
            /^\d+$/.test(user.email?.split("@")[0])
          )
            next();
          else return res.send(createResponse(EMAIL_NOT_ALLOWED, null));
        } else next();
      } else return res.send(createResponse(INVALID_TOKEN, null));
    }
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, null));
  }
};
