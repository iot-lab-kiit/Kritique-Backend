import express from "express";
import {
  addToWaitList,
  getWaitList,
  removeFromWaitList
} from "../controllers/waitlist";
const router = express.Router();

// JSON
router.get("/", getWaitList);
router.post("/", addToWaitList);
router.delete("/", removeFromWaitList);

export default router;

