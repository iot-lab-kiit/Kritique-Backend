import dotenv from "dotenv";
import { firebaseAuth } from "../lib/firebase-admin";
import { NextFunction, Request, Response } from "express";
import { createResponse } from "../../response";
import {
  INTERNAL_SERVER_ERROR,
  INVALID_TOKEN,
  TOKEN_REQUIRED,
} from "../constants/statusCode";
import { FirebaseUser } from "../@types/user";

dotenv.config();

export const authToken = async (
  req: Request & { user?: FirebaseUser },
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
      const user = (await firebaseAuth.verifyIdToken(token)) as FirebaseUser;
      if (user) {
        if (
          user.email?.endsWith("@kiit.ac.in") &&
          process.env.ALLOW_KIIT_ONLY === 'true'
        ) {
          req.user = user;
          console.log(req.user);
          next();
        }
      } else
        return res.send(createResponse(INVALID_TOKEN, "Invalid Token", null));
    }
  } catch (error: any) {
    console.log(error);
    return res.send(createResponse(INTERNAL_SERVER_ERROR, error.message, null));
  }
};
