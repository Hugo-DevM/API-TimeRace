import express from "express";
import {
    getRunnersByLeague,
    createRunner,
    updateRunner,
    deleteRunner,
} from "../controllers/runnersController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Obtener corredores de una liga
router.get("/:leagueId", authenticateToken, getRunnersByLeague);

// Crear corredor en una liga (elige categoría desde frontend)
router.post("/:leagueId", authenticateToken, createRunner);

// Actualizar corredor
router.put("/:id", authenticateToken, updateRunner);

// Eliminar corredor
router.delete("/:id", authenticateToken, deleteRunner);

export default router;
