import pool from "../utils/db.js";

export const getRacesByLeague = async (req, res) => {
    const { leagueId } = req.params;

    try {
        const result = await pool.query(
            `SELECT id, league_id, name, race_number, location, date, state
         FROM race
         WHERE league_id = $1
         ORDER BY race_number ASC`,
            [leagueId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener carreras:", err.message);
        res.status(500).json({ error: "Error al obtener las carreras" });
    }
};

export const getRaceById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM race WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Carrera no encontrada" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener la carrera" });
    }
};

export const createRace = async (req, res) => {
    const { leagueId } = req.params;
    const { name, race_number, location, date } = req.body;

    if (!name || !race_number) {
        return res.status(400).json({
            error: "Faltan campos obligatorios: name o race_number",
        });
    }

    try {
        const leagueRes = await pool.query(
            "SELECT num_races FROM league WHERE id = $1",
            [leagueId]
        );
        const league = leagueRes.rows[0];

        if (!league) {
            return res.status(404).json({ error: "Liga no encontrada" });
        }
        const raceCountRes = await pool.query(
            "SELECT COUNT(*) FROM race WHERE league_id = $1",
            [leagueId]
        );
        const currentCount = parseInt(raceCountRes.rows[0].count, 10);

        if (currentCount >= league.num_races) {
            return res.status(400).json({
                error: `Esta liga ya tiene el número máximo de carreras permitidas (${league.num_races}).`,
            });
        }

        const result = await pool.query(
            `INSERT INTO race (league_id, name, race_number, location, date, state)
         VALUES ($1, $2, $3, $4, $5, 'pendiente')
         RETURNING id, league_id, name, race_number, location, date, state`,
            [leagueId, name, race_number, location || null, date || new Date()]
        );
        const remaining = league.num_races - (currentCount + 1);

        res.status(201).json({
            ...result.rows[0],
            message: `Carrera creada correctamente. Quedan ${remaining} carreras por crear en esta liga.`,
        });
    } catch (err) {
        console.error("Error al crear la carrera:", err.message);
        res.status(500).json({ error: "Error al crear la carrera" });
    }
};

export const deleteRace = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM race WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Carrera no encontrada" });
        }

        res.json({ message: "Carrera eliminada correctamente" });
    } catch (err) {
        console.error("Error al eliminar carrera:", err.message);
        res.status(500).json({ error: "Error al eliminar la carrera" });
    }
};