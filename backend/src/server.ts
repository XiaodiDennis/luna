import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { songsRouter } from "./routes/songs";
import { sessionsRouter } from "./routes/sessions";
import { generationRouter } from "./routes/generation";
import { authRouter } from "./routes/auth";
import assessmentRouter from "./routes/assessment";
import generationRouter from "./routes/generation";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "luna-api",
  });
});

app.use("/api/songs", songsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/generation", generationRouter);
app.use("/api/auth", authRouter);
app.use("/api/assessment", assessmentRouter);
app.use("/api/generation", generationRouter);

app.listen(port, () => {
  console.log(`Luna API running on http://localhost:${port}`);
});

