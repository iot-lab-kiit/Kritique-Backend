import dotenv from "dotenv";
import { firebaseAuth } from "../lib/firebase-admin";
import { NextFunction, Request, Response } from "express";
import { createResponse } from "../../response";
import {
  INTERNAL_SERVER_ERROR,
  INVALID_TOKEN,
  TOKEN_REQUIRED,
} from "../constants/statusCode";

dotenv.config();

export const authToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;
    if (process.env.ACCESS_TOKEN_DISABLED === "true") next();
    else {
      if (!req.headers.authorization)
        return res.send(createResponse(TOKEN_REQUIRED, "Token required", null));
      token = req.headers.authorization.split(" ")[1];
      if (await verifyIdToken(token)) next();
      else
        return res.send(createResponse(INVALID_TOKEN, "Invalid Token", null));
    }
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, error.message, null));
  }
};

const verifyIdToken = async (token: string) => {
  try {
    const user = await firebaseAuth.verifyIdToken(token);
    return user ? true : false;
  } catch (error) {
    console.log(error);
    return false;
  }
};
