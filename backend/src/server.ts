import express from "express";
import cors from "cors";

import * as authRouterModule from "./routes/auth";
import * as songsRouterModule from "./routes/songs";
import * as sessionsRouterModule from "./routes/sessions";
import * as generationRouterModule from "./routes/generation";
import * as assessmentRouterModule from "./routes/assessment";

const app = express();

const PORT = Number(process.env.PORT) || 4000;

function getRouter(moduleValue: unknown, routeName: string) {
  const maybeModule = moduleValue as Record<string, unknown>;

  const candidates = [
    maybeModule.default,
    maybeModule.router,
    maybeModule.authRouter,
    maybeModule.songsRouter,
    maybeModule.sessionsRouter,
    maybeModule.generationRouter,
    maybeModule.assessmentRouter,
    ...Object.values(maybeModule),
  ];

  const router = candidates.find((candidate) => typeof candidate === "function");

  if (!router) {
    console.error(`${routeName} module did not export an Express router.`);
    console.error(moduleValue);
    throw new TypeError(`${routeName} must be an Express router function.`);
  }

  return router as express.Router;
}

const authRouter = getRouter(authRouterModule, "authRouter");
const songsRouter = getRouter(songsRouterModule, "songsRouter");
const sessionsRouter = getRouter(sessionsRouterModule, "sessionsRouter");
const generationRouter = getRouter(generationRouterModule, "generationRouter");
const assessmentRouter = getRouter(assessmentRouterModule, "assessmentRouter");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://lunamova.org",
      "https://www.lunamova.org",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "luna-api",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "luna-api",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/songs", songsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/generation", generationRouter);
app.use("/api/assessment", assessmentRouter);

app.use((_req, res) => {
  res.status(404).json({
    error: "Route not found.",
  });
});

app.listen(PORT, () => {
  console.log(`Luna API running on http://localhost:${PORT}`);
});