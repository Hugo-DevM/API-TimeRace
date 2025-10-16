import express from "express";
import {
    getLeaguesByUser,
    createLeague,
    updateLeague,
    deleteLeague,
} from "../controllers/leaguesController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, getLeaguesByUser);
router.post("/", authenticateToken, createLeague);
router.put("/:id", authenticateToken, updateLeague);
router.delete("/:id", authenticateToken, deleteLeague);

export default router;
