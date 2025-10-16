import express from "express";
import {
    getCategoriesByRace,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/categoriesController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/:raceId", authenticateToken, getCategoriesByRace);
router.post("/:raceId", authenticateToken, createCategory);
router.put("/:id", authenticateToken, updateCategory);
router.delete("/:id", authenticateToken, deleteCategory);

export default router;
