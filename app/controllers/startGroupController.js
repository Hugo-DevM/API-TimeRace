import pool from "../utils/db.js";

export const createStartGroup = async (req, res) => {
    const { race_id, name, category_ids } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO start_group (race_id, name) VALUES ($1, $2) RETURNING id",
            [race_id, name]
        );
        const groupId = result.rows[0].id;

        for (const catId of category_ids) {
            await pool.query(
                "INSERT INTO start_group_category (start_group_id, category_id) VALUES ($1, $2)",
                [groupId, catId]
            );
        }

        res.status(201).json({ message: "Grupo creado", groupId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear grupo de salida" });
    }
};

export const getStartGroups = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT sg.id, sg.name, array_agg(c.name) AS categories
      FROM start_group sg
      JOIN start_group_category sgc ON sg.id = sgc.start_group_id
      JOIN category c ON c.id = sgc.category_id
      GROUP BY sg.id
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener grupos" });
    }
};

export const getRunnersByStartGroup = async (req, res) => {
    const { groupId } = req.params;
    try {
        const result = await pool.query(`
        SELECT r.name, r.num_dorsal, c.name AS category, sg.name AS group_name
        FROM start_group sg
        JOIN start_group_category sgc ON sg.id = sgc.start_group_id
        JOIN category c ON sgc.category_id = c.id
        JOIN runner r ON r.category_id = c.id
        WHERE sg.id = $1
        ORDER BY c.name, r.num_dorsal ASC
      `, [groupId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener corredores del grupo" });
    }
};

export const startRaceGroup = async (req, res) => {
    const { groupId } = req.params;

    try {
        const result = await pool.query(
            "UPDATE start_group SET start_time = NOW() WHERE id = $1 RETURNING id, name, start_time",
            [groupId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Grupo no encontrado" });
        }

        res.json({
            message: "Cronómetro iniciado correctamente",
            group: result.rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al iniciar el grupo de salida" });
    }
};
