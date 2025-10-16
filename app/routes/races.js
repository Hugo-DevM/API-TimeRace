import express from "express";
import {
    getRacesByLeague,
    createRace,
    deleteRace,
} from "../controllers/racesController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/:leagueId", authenticateToken, getRacesByLeague);
router.post("/:leagueId", authenticateToken, createRace);
router.delete("/:id", authenticateToken, deleteRace);

export default router;
