import express from "express";
import { registerLap, getAllLaps } from "../controllers/lapsController.js";

const router = express.Router();

router.post("/", registerLap);
router.get("/", getAllLaps);

export default router;