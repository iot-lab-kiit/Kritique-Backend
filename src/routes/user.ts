import express from "express";
import { authorizeUser, deleteUser } from "../controllers/auth";
const router = express.Router();

router.post("/", authorizeUser);
router.delete("/", deleteUser);

export default router;
