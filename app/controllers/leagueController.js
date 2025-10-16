import pool from "../utils/db.js";

export const getLeaguesByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT id, name_league, num_races, state, created_at
       FROM league
       WHERE user_id = $1
       ORDER BY created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener ligas:", err.message);
        res.status(500).json({ error: "Error al obtener las ligas" });
    }
};

export const createLeague = async (req, res) => {
    const { name_league, num_races } = req.body;
    const userId = req.user.id;

    if (!name_league || !num_races) {
        return res.status(400).json({ error: "Faltan datos: nombre o número de carreras" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO league (user_id, name_league, num_races, state)
       VALUES ($1, $2, $3, 'activa')
       RETURNING id, name_league, num_races, state, created_at`,
            [userId, name_league, num_races]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error al crear liga:", err.message);
        res.status(500).json({ error: "Error al crear la liga" });
    }
};

export const updateLeague = async (req, res) => {
    const { id } = req.params;
    const { name_league, num_races, state } = req.body;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `UPDATE league
       SET name_league = COALESCE($1, name_league),
           num_races = COALESCE($2, num_races),
           state = COALESCE($3, state)
       WHERE id = $4 AND user_id = $5
       RETURNING id, name_league, num_races, state, created_at`,
            [name_league, num_races, state, id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Liga no encontrada o no pertenece al usuario" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error al actualizar liga:", err.message);
        res.status(500).json({ error: "Error al actualizar la liga" });
    }
};

export const deleteLeague = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `DELETE FROM league
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Liga no encontrada o no pertenece al usuario" });
        }

        res.json({ message: "Liga eliminada correctamente" });
    } catch (err) {
        console.error("Error al eliminar liga:", err.message);
        res.status(500).json({ error: "Error al eliminar la liga" });
    }
};
