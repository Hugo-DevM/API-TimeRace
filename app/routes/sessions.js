import express from "express";
import { loginUser, verifyToken, verifyAdmin, logoutUser } from "../controllers/sessionsController.js";
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router();

// Login -> genera token
router.post("/login", loginUser);

router.get("/verify/:token", verifyToken);

router.post("/logout", authenticateToken, logoutUser)

router.get("/race", authenticateToken, (req, res) => {
    res.json({ message: "Perfil del usuario", user: req.user });
});

router.get("/admin", authenticateToken, verifyAdmin, (req, res) => {
    res.json({ message: "Bienvenido, admin" });
});

export default router;
