import pool from "../utils/db.js";

export const getCategoriesByRace = async (req, res) => {
    const { raceId } = req.params;

    try {
        const result = await pool.query(
            `SELECT id, race_id, name, laps
       FROM category
       WHERE race_id = $1
       ORDER BY id ASC`,
            [raceId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener categorías:", err.message);
        res.status(500).json({ error: "Error al obtener las categorías" });
    }
};

export const createCategory = async (req, res) => {
    const { raceId } = req.params;
    const { name, laps } = req.body;

    if (!name || !laps) {
        return res.status(400).json({
            error: "Faltan campos obligatorios: name o laps",
        });
    }

    try {
        const raceRes = await pool.query("SELECT id FROM race WHERE id = $1", [raceId]);
        if (raceRes.rows.length === 0) {
            return res.status(404).json({ error: "Carrera no encontrada" });
        }

        const result = await pool.query(
            `INSERT INTO category (race_id, name, laps)
       VALUES ($1, $2, $3)
       RETURNING id, race_id, name, laps`,
            [raceId, name, laps]
        );

        res.status(201).json({
            message: "Categoría creada correctamente",
            category: result.rows[0],
        });
    } catch (err) {
        console.error("Error al crear categoría:", err.message);
        res.status(500).json({ error: "Error al crear la categoría" });
    }
};

export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, laps } = req.body;

    try {
        const result = await pool.query(
            `UPDATE category
       SET name = COALESCE($1, name),
           laps = COALESCE($2, laps)
       WHERE id = $3
       RETURNING id, race_id, name, laps`,
            [name, laps, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        res.json({
            message: "Categoría actualizada correctamente",
            category: result.rows[0],
        });
    } catch (err) {
        console.error("Error al actualizar categoría:", err.message);
        res.status(500).json({ error: "Error al actualizar la categoría" });
    }
};

export const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM category WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        res.json({ message: "Categoría eliminada correctamente" });
    } catch (err) {
        console.error("Error al eliminar categoría:", err.message);
        res.status(500).json({ error: "Error al eliminar la categoría" });
    }
};
