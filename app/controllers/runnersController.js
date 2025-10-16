import pool from "../utils/db.js";

export const getRunnersByLeague = async (req, res) => {
    const { leagueId } = req.params;

    try {
        const result = await pool.query(
            `SELECT r.id, r.name, r.num_dorsal, r.team_name, r.subscribe, r.points, 
              c.name AS category_name
       FROM runner r
       JOIN category c ON r.category_id = c.id
       WHERE r.league_id = $1
       ORDER BY c.name ASC, r.num_dorsal ASC`,
            [leagueId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener corredores:", err.message);
        res.status(500).json({ error: "Error al obtener los corredores" });
    }
};

export const createRunner = async (req, res) => {
    const { leagueId } = req.params;
    const { name, num_dorsal, category_id, team_name, subscribe } = req.body;

    if (!name || !num_dorsal || !category_id) {
        return res.status(400).json({
            error: "Faltan campos obligatorios: name, num_dorsal o category_id",
        });
    }

    try {
        const leagueRes = await pool.query("SELECT id FROM league WHERE id = $1", [leagueId]);
        if (leagueRes.rows.length === 0) {
            return res.status(404).json({ error: "Liga no encontrada" });
        }

        const categoryRes = await pool.query(
            `SELECT c.id 
       FROM category c
       JOIN race r ON c.race_id = r.id
       WHERE c.id = $1 AND r.league_id = $2`,
            [category_id, leagueId]
        );

        if (categoryRes.rows.length === 0) {
            return res.status(400).json({ error: "La categoría no pertenece a esta liga" });
        }

        const existingRes = await pool.query(
            "SELECT * FROM runner WHERE num_dorsal = $1 AND league_id = $2",
            [num_dorsal, leagueId]
        );
        if (existingRes.rows.length > 0) {
            return res.status(400).json({ error: "El número de dorsal ya está en uso en esta liga" });
        }

        const result = await pool.query(
            `INSERT INTO runner (name, num_dorsal, category_id, league_id, team_name, subscribe, points)
       VALUES ($1, $2, $3, $4, $5, $6, 0)
       RETURNING id, name, num_dorsal, category_id, league_id, team_name, subscribe, points`,
            [name, num_dorsal, category_id, leagueId, team_name || null, subscribe ?? false]
        );

        res.status(201).json({
            message: "Corredor creado correctamente",
            runner: result.rows[0],
        });
    } catch (err) {
        console.error("Error al crear corredor:", err.message);
        res.status(500).json({ error: "Error al crear el corredor" });
    }
};

export const updateRunner = async (req, res) => {
    const { id } = req.params;
    const { name, num_dorsal, team_name, subscribe, points, category_id } = req.body;

    try {
        const result = await pool.query(
            `UPDATE runner
       SET name = COALESCE($1, name),
           num_dorsal = COALESCE($2, num_dorsal),
           team_name = COALESCE($3, team_name),
           subscribe = COALESCE($4, subscribe),
           points = COALESCE($5, points),
           category_id = COALESCE($6, category_id)
       WHERE id = $7
       RETURNING *`,
            [name, num_dorsal, team_name, subscribe, points, category_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Corredor no encontrado" });
        }

        res.json({
            message: "Corredor actualizado correctamente",
            runner: result.rows[0],
        });
    } catch (err) {
        console.error("Error al actualizar corredor:", err.message);
        res.status(500).json({ error: "Error al actualizar el corredor" });
    }
};

export const deleteRunner = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM runner WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Corredor no encontrado" });
        }

        res.json({ message: "Corredor eliminado correctamente" });
    } catch (err) {
        console.error("Error al eliminar corredor:", err.message);
        res.status(500).json({ error: "Error al eliminar el corredor" });
    }
};
