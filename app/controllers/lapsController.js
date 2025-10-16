import pool from "../utils/db.js"

export const registerLap = async (req, res) => {
    const { num_dorsal } = req.body;

    try {
        // Buscar el corredor
        const runnerResult = await pool.query(
            "SELECT id, name, category_id FROM runner WHERE num_dorsal = $1",
            [num_dorsal]
        );

        if (runnerResult.rows.length === 0) {
            return res.status(404).json({ error: "Corredor no encontrado" });
        }

        const runner = runnerResult.rows[0];
        const runnerId = runner.id;

        // Obtener el race_id mediante la categoría
        const raceResult = await pool.query(
            "SELECT race_id FROM category WHERE id = $1",
            [runner.category_id]
        );

        if (raceResult.rows.length === 0) {
            return res.status(400).json({ error: "No se encontró la carrera para este corredor" });
        }

        const raceId = raceResult.rows[0].race_id;

        // Obtener última vuelta
        const lastLapResult = await pool.query(
            "SELECT timestamp_record FROM lap WHERE runner_id = $1 ORDER BY timestamp_record DESC LIMIT 1",
            [runnerId]
        );

        const now = new Date();
        let lapTimeMs = 0;

        if (lastLapResult.rows.length > 0) {
            const lastLapTime = new Date(lastLapResult.rows[0].timestamp_record);
            lapTimeMs = now - lastLapTime;
        }

        // Contar vueltas previas
        const lapCountResult = await pool.query(
            "SELECT COUNT(*) FROM lap WHERE runner_id = $1",
            [runnerId]
        );
        const numLap = parseInt(lapCountResult.rows[0].count) + 1;

        // Calcular tiempo de vuelta
        const lapTime = new Date(lapTimeMs).toISOString().substring(11, 19);

        // Insertar nueva vuelta
        await pool.query(
            `INSERT INTO lap (runner_id, race_id, num_lap, time, lap_time_ms, timestamp_record)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
            [runnerId, raceId, numLap, lapTime, lapTimeMs]
        );

        // Calcular tiempo total
        const totalResult = await pool.query(
            `SELECT MIN(timestamp_record) AS start, MAX(timestamp_record) AS end
       FROM lap WHERE runner_id = $1`,
            [runnerId]
        );

        const { start, end } = totalResult.rows[0];
        const totalTime =
            end && start
                ? new Date(new Date(end) - new Date(start)).toISOString().substring(11, 19)
                : "00:00:00";

        res.json({
            message: "Vuelta registrada correctamente",
            runner: runner.name,
            dorsal: num_dorsal,
            numLap,
            lapTime,
            totalTime,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al registrar la vuelta" });
    }
};

export const getAllLaps = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT l.id, r.name, r.num_dorsal, l.num_lap, l.time, l.timestamp_record
      FROM lap l
      JOIN runner r ON r.id = l.runner_id
      ORDER BY l.timestamp_record DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener las vueltas" });
    }
};
