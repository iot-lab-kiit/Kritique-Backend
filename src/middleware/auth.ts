import dotenv from "dotenv";
import { firebaseAuth } from "../lib/firebase-admin";
import { NextFunction, Request, Response } from "express";

dotenv.config();

export const authToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;
  try {
    if (process.env.ACCESS_TOKEN_DISABLED === "true") next();
    else {
      if (!req.headers.authorization)
        return res.status(401).send("Token is required");
      token = req.headers.authorization.split(" ")[1];
      if (await verifyIdToken(token)) next();
      else return res.status(401).send("Invalid Token");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
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
