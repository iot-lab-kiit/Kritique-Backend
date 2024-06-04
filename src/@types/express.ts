import { Request } from "express";
import { DecodedIdToken } from "firebase-admin/auth";

export interface NewRequest extends Request {
  user?: DecodedIdToken;
}
