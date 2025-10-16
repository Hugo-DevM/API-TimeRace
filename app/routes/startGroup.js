import express from "express";
import { createStartGroup, getStartGroups, getRunnersByStartGroup, startRaceGroup } from "../controllers/startGroupController.js"
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateToken, createStartGroup);
router.get("/", authenticateToken, getStartGroups);
router.get("/:groupId/runners", authenticateToken, getRunnersByStartGroup);
router.put("/:groupId/start", authenticateToken, startRaceGroup);

export default router;
