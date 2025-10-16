import pool from "../utils/db.js";

export const getLiveResults = async (req, res) => {
    const { race_id } = req.params;

    try {
        const result = await pool.query(
            `
        SELECT 
          r.id AS runner_id,
          r.name,
          r.num_dorsal,
          c.name AS category,
          sg.name AS group_name,
          COUNT(l.id) AS laps,
          EXTRACT(EPOCH FROM (
            COALESCE(MAX(l.timestamp_record), NOW()) - sg.start_time
          )) AS total_seconds
        FROM runner r
        JOIN category c ON c.id = r.category_id
        JOIN race rc ON c.race_id = rc.id
        LEFT JOIN lap l ON l.runner_id = r.id
        LEFT JOIN start_group_category sgc ON sgc.category_id = c.id
        LEFT JOIN start_group sg ON sg.id = sgc.start_group_id
        WHERE rc.id = $1
        GROUP BY r.id, r.name, r.num_dorsal, c.name, sg.name, sg.start_time
        ORDER BY sg.name, c.name, total_seconds ASC NULLS LAST
        `,
            [race_id]
        );

        const grouped = {};

        result.rows.forEach((row) => {
            const groupKey = row.group_name || "Sin grupo";
            const categoryKey = row.category || "Sin categoría";

            if (!grouped[groupKey]) grouped[groupKey] = {};
            if (!grouped[groupKey][categoryKey]) grouped[groupKey][categoryKey] = [];

            grouped[groupKey][categoryKey].push({
                dorsal: row.num_dorsal,
                corredor: row.name,
                vueltas: row.laps,
                tiempo_total: row.total_seconds
                    ? new Date(row.total_seconds * 1000).toISOString().substring(11, 19)
                    : "00:00:00",
            });
        });

        res.json(grouped);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener los resultados en vivo" });
    }
};


export const saveFinalResult = async (req, res) => {
    const { race_id, runner_id, total_time, position } = req.body;

    try {
        await pool.query(
            `INSERT INTO results (runner_id, race_id, total_time, position)
       VALUES ($1, $2, $3, $4)`,
            [runner_id, race_id, total_time, position]
        );
        res.status(201).json({ message: "Resultado final guardado correctamente" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al guardar resultado" });
    }
};
