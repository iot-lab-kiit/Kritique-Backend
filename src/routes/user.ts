import express from "express";
import { authorizeUser, deleteUser, getUserHistory } from "../controllers/user";
import { authToken } from "../middleware/auth";
const router = express.Router();

router.post("/", authorizeUser);
router.delete("/:id", authToken, deleteUser);
router.get("/:id", authToken, getUserHistory);

export default router;
