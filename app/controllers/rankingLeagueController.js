import pool from "../utils/db.js";
import { getPointsForPosition } from "../utils/points.js";

export const updateLeagueRanking = async (req, res) => {
    const { leagueId } = req.params;

    try {
        const resultsRes = await pool.query(
            `
      SELECT 
        r.id AS runner_id,
        r.subscribe,
        rs.position,
        rs.race_id
      FROM results rs
      JOIN runner r ON r.id = rs.runner_id
      JOIN race ra ON ra.id = rs.race_id
      WHERE ra.league_id = $1
      ORDER BY rs.race_id, rs.position ASC
      `,
            [leagueId]
        );

        if (resultsRes.rows.length === 0) {
            return res.status(404).json({ error: "No hay resultados para esta liga" });
        }

        const results = resultsRes.rows;

        const pointsByRunner = {};

        const races = [...new Set(results.map(r => r.race_id))];

        for (const raceId of races) {
            const raceResults = results.filter(r => r.race_id === raceId);

            const subscribed = raceResults.filter(r => r.subscribe === true);

            subscribed.forEach((runner, index) => {
                const adjustedPosition = index + 1;
                const points = getPointsForPosition(adjustedPosition);

                if (!pointsByRunner[runner.runner_id]) pointsByRunner[runner.runner_id] = 0;
                pointsByRunner[runner.runner_id] += points;
            });
        }

        await pool.query("DELETE FROM ranking_league WHERE league_id = $1", [leagueId]);

        const rankingData = Object.entries(pointsByRunner)
            .map(([runner_id, total_points]) => ({ runner_id: parseInt(runner_id), total_points }))
            .sort((a, b) => b.total_points - a.total_points);

        let position = 1;
        for (const r of rankingData) {
            await pool.query(
                `INSERT INTO ranking_league (league_id, runner_id, total_points, position)
         VALUES ($1, $2, $3, $4)`,
                [leagueId, r.runner_id, r.total_points, position]
            );
            position++;
        }

        res.json({
            message: "Ranking de liga actualizado correctamente",
            ranking: rankingData,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar el ranking de liga" });
    }
};

export const getLeagueRanking = async (req, res) => {
    const { leagueId } = req.params;

    try {
        const result = await pool.query(
            `
        SELECT 
          rl.position,
          r.name AS runner_name,
          r.team_name,
          rl.total_points
        FROM ranking_league rl
        JOIN runner r ON rl.runner_id = r.id
        WHERE rl.league_id = $1
        ORDER BY rl.position ASC
        `,
            [leagueId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No hay ranking disponible para esta liga" });
        }

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener el ranking de liga" });
    }
};

export const getLeagueRankingByCategory = async (req, res) => {
    const { leagueId } = req.params;

    try {
        const result = await pool.query(
            `
        SELECT 
          c.name AS category_name,
          r.name AS runner_name,
          r.team_name,
          rl.total_points,
          rl.position
        FROM ranking_league rl
        JOIN runner r ON rl.runner_id = r.id
        JOIN category c ON r.category_id = c.id
        WHERE rl.league_id = $1
          AND r.subscribe = true
        ORDER BY c.name ASC, rl.position ASC
        `,
            [leagueId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No hay ranking disponible para esta liga" });
        }

        const grouped = {};
        result.rows.forEach(row => {
            if (!grouped[row.category_name]) grouped[row.category_name] = [];
            grouped[row.category_name].push({
                corredor: row.runner_name,
                equipo: row.team_name,
                puntos: row.total_points,
                posicion: row.position
            });
        });

        res.json(grouped);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener ranking por categoría" });
    }
};
