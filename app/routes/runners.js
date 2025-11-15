import express from "express";
import {
    getRunnersByLeague,
    createRunner,
    updateRunner,
    deleteRunner,
} from "../controllers/runnersController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/race/:raceId", authenticateToken, getRunnersByLeague);
router.post("/race/:raceId", authenticateToken, createRunner);
router.put("/:id", authenticateToken, updateRunner);
router.delete("/:id", authenticateToken, deleteRunner);

export default router;
