import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usersRoutes from "./routes/users.js";
import sessionsRoutes from "./routes/sessions.js";
import leagueRoutes from "./routes/league.js";
import racesRoutes from "./routes/races.js";
import categoriesRoutes from "./routes/categories.js";
import runnersRoutes from "./routes/runners.js";
import lapsRoutes from "./routes/laps.js";
import resultsRoutes from "./routes/results.js";
import startGroupRoutes from "./routes/startGroup.js";
import rankingLeagueRoutes from "./routes/rankingLeague.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/users", usersRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/leagues", leagueRoutes);
app.use("/api/races", racesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/runners", runnersRoutes);
app.use("/api/laps", lapsRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/startgroups", startGroupRoutes);
app.use("/api/rankingleague", rankingLeagueRoutes);

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
