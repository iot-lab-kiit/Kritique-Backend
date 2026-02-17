import express from "express";
import {
  addToWaitList,
  getWaitList,
  removeFromWaitList
} from "../controllers/waitlist";
import { authToken } from "../middleware/auth";
const router = express.Router();

// JSON
router.get("/", authToken, getWaitList);
router.post("/", authToken, addToWaitList);
router.delete("/", authToken, removeFromWaitList);

export default router;

