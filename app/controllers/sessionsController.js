import pool from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = userResult.rows[0];

        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: "Contraseña incorrecta" });

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2h" });


        const expiresIn = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas
        await pool.query(
            "INSERT INTO session (user_id, token, expires_at) VALUES ($1, $2, $3)",
            [user.id, token, expiresIn]
        );

        res.json({ token, expiresIn, role: user.role });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error en login" });
    }
};

export const verifyToken = async (req, res) => {
    const { token } = req.params;

    try {
        const result = await pool.query("SELECT * FROM session WHERE token = $1", [token]);
        const session = result.rows[0];
        if (!session) return res.status(401).json({ error: "Token inválido" });

        if (new Date(session.expires_at) < new Date()) return res.status(401).json({ error: "Token expirado" });

        jwt.verify(token, process.env.JWT_SECRET);

        res.json({ valid: true, userId: session.user_id });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error al verificar token" });
    }
};


export const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token requerido' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'No autorizado' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

export const logoutUser = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(400).json({ error: "Token requerido" });

    const token = authHeader.split(" ")[1];

    try {
        await pool.query("DELETE FROM session WHERE token = $1", [token]);
        res.json({ message: "Sesión cerrada correctamente" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al cerrar sesión" });
    }
};
