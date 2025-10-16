import express from "express";
import { updateLeagueRanking, getLeagueRanking, getLeagueRankingByCategory } from "../controllers/rankingLeagueController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/:leagueId", authenticateToken, getLeagueRanking);
router.put("/update/:leagueId", authenticateToken, updateLeagueRanking);
router.get("/:leagueId/by-category", authenticateToken, getLeagueRankingByCategory);

export default router;
