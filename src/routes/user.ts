import express from "express";
const router = express.Router();
import { authToken } from "../middleware/auth";
import { authorizeUser, deleteUser } from "../controllers/user";

// router.post("/", authorizeUser);
// router.delete("/:id", authToken, deleteUser);

export default router;
