import jwt from "jsonwebtoken";
import pool from "../utils/db.js";
import dotenv from "dotenv";

dotenv.config();

export const authenticateToken = async (req, res, next) => {

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Token no proporcionado" });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const result = await pool.query(
            "SELECT * FROM session WHERE token = $1",
            [token]
        );

        const session = result.rows[0];
        if (!session) return res.status(401).json({ error: "Token inválido" });
        if (new Date(session.expires_at) < new Date()) return res.status(401).json({ error: "Token expirado" });

        req.user = {
            id: payload.userId,
            role: payload.role
        };

        next();
    } catch (err) {
        console.error(err);
        return res.status(403).json({ error: "Token inválido o expirado" });
    }
};
