import express from "express";
import {
    getLiveResults,
    saveFinalResult,
} from "../controllers/resultsController.js";

const router = express.Router();

router.get("/live", getLiveResults);
router.post("/", saveFinalResult);

export default router;
