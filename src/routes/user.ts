import express from "express";
const router = express.Router();
import { authToken } from "../middleware/auth";
import { authorizeUser, deleteUser, getUserHistory } from "../controllers/user";

router.post("/", authorizeUser);
router.delete("/:id", authToken, deleteUser);
router.get("/:id", authToken, getUserHistory);

export default router;
