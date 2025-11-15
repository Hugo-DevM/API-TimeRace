import express from "express";
import {
    getRacesByLeague,
    createRace,
    deleteRace,
    getRaceById
} from "../controllers/racesController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/league/:leagueId", authenticateToken, getRacesByLeague);
router.get("/:id", authenticateToken, getRaceById)
router.post("/:leagueId", authenticateToken, createRace);
router.delete("/:id", authenticateToken, deleteRace);

export default router;
