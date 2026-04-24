import { Router } from "express";
import { prisma } from "../lib/prisma";

export const sessionsRouter = Router();

sessionsRouter.get("/", async (_req, res) => {
  try {
    const sessions = await prisma.sessionResult.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
      include: {
        song: {
          select: {
            id: true,
            title: true,
            level: true,
            genreUk: true,
          },
        },
      },
    });

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load session results" });
  }
});

sessionsRouter.get("/summary", async (_req, res) => {
  try {
    const sessions = await prisma.sessionResult.findMany();

    const totalSessions = sessions.length;
    const totalScore = sessions.reduce((sum, item) => sum + item.score, 0);
    const totalWords = sessions.reduce((sum, item) => sum + item.totalWords, 0);
    const totalCorrectWords = sessions.reduce(
      (sum, item) => sum + item.correctWords,
      0
    );
    const totalMistakes = sessions.reduce((sum, item) => sum + item.mistakes, 0);
    const totalDurationSec = sessions.reduce(
      (sum, item) => sum + (item.durationSec ?? 0),
      0
    );

    const bestScore =
      totalSessions === 0 ? 0 : Math.max(...sessions.map((item) => item.score));

    const averageAccuracy =
      totalSessions === 0
        ? 0
        : Math.round(
            sessions.reduce((sum, item) => sum + item.accuracy, 0) /
              totalSessions
          );

    res.json({
      totalSessions,
      totalScore,
      totalWords,
      totalCorrectWords,
      totalMistakes,
      totalDurationSec,
      bestScore,
      averageAccuracy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load progress summary" });
  }
});

sessionsRouter.post("/", async (req, res) => {
  try {
    const result = await prisma.sessionResult.create({
      data: {
        songId: String(req.body.songId),
        mode: String(req.body.mode ?? "dictation"),
        score: Number(req.body.score ?? 0),
        accuracy: Number(req.body.accuracy ?? 0),
        totalWords: Number(req.body.totalWords ?? 0),
        correctWords: Number(req.body.correctWords ?? 0),
        mistakes: Number(req.body.mistakes ?? 0),
        durationSec: req.body.durationSec ? Number(req.body.durationSec) : null,
      },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save session result" });
  }
});
