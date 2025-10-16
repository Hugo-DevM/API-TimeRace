import pool from "../utils/db.js"
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
    try {
        const result = await pool.query("SELECT id, company, email, license FROM users WHERE role = 'user'");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
};

export const createUser = async (req, res) => {
    const { company, email, password, role } = req.body;

    if (!company || !email || !password) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO users (company, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, company, email, role, license",
            [company, email, passwordHash, role || "user"]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error al crear usuario:", err.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { license } = req.body;

    try {
        const result = await pool.query(
            "UPDATE users SET license = $1 WHERE id = $2 RETURNING *", [license, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
}

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario eliminado correctamente" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
};
