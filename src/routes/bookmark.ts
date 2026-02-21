import express from "express";
import {
  addToBookmark,
  getBookmark,
  removeFromBookmark,
} from "../controllers/bookmark";

const router = express.Router();

// JSON
router.get("/", getBookmark);
router.post("/", addToBookmark);
router.delete("/", removeFromBookmark);

export default router;
