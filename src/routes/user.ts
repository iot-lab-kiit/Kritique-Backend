import express from "express";
import { authorizeUser, deleteUser } from "../controllers/auth";
const router = express.Router();

router.post("/", authorizeUser);
router.delete("/", deleteUser);
// get user history

export default router;
