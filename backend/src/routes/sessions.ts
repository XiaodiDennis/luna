import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const router = Router();

const AUTH_SECRET = process.env.AUTH_SECRET || "luna-dev-secret";

function getAuthToken(headerValue: string | undefined) {
  if (!headerValue) return null;

  const [type, token] = headerValue.split(" ");

  if (type !== "Bearer" || !token) return null;

  return token;
}

function getAuthPayload(headerValue: string | undefined) {
  const token = getAuthToken(headerValue);

  if (!token) return null;

  try {
    return jwt.verify(token, AUTH_SECRET) as {
      userId: string;
      role?: string;
    };
  } catch {
    return null;
  }
}

function getSessionWhereClause(payload: { userId: string; role?: string } | null) {
  if (!payload) {
    return {};
  }

  if (payload.role === "teacher") {
    return {};
  }

  return {
    userId: payload.userId,
  };
}

router.get("/", async (req, res) => {
  try {
    const payload = getAuthPayload(req.headers.authorization);

    const sessions = await prisma.sessionResult.findMany({
      where: getSessionWhereClause(payload),
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            level: true,
          },
        },
      },
    });

    return res.json(sessions);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to load session results.",
    });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const payload = getAuthPayload(req.headers.authorization);
    const where = getSessionWhereClause(payload);

    const sessions = await prisma.sessionResult.findMany({
      where,
      select: {
        score: true,
        accuracy: true,
        totalWords: true,
        correctWords: true,
        mistakes: true,
        durationSec: true,
      },
    });

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
      sessions.length === 0
        ? 0
        : Math.max(...sessions.map((item) => item.score));

    const averageAccuracy =
      sessions.length === 0
        ? 0
        : Math.round(
            sessions.reduce((sum, item) => sum + item.accuracy, 0) /
              sessions.length
          );

    return res.json({
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

    return res.status(500).json({
      error: "Failed to load progress summary.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const payload = getAuthPayload(req.headers.authorization);

    const {
      songId,
      mode,
      score,
      accuracy,
      totalWords,
      correctWords,
      mistakes,
      durationSec,
    } = req.body;

    if (!songId || !mode) {
      return res.status(400).json({
        error: "songId and mode are required.",
      });
    }

    const session = await prisma.sessionResult.create({
      data: {
        userId: payload?.userId ?? null,
        songId: String(songId),
        mode: String(mode),
        score: Number(score ?? 0),
        accuracy: Number(accuracy ?? 0),
        totalWords: Number(totalWords ?? 0),
        correctWords: Number(correctWords ?? 0),
        mistakes: Number(mistakes ?? 0),
        durationSec:
          durationSec === undefined || durationSec === null
            ? null
            : Number(durationSec),
      },
      include: {
        song: {
          select: {
            id: true,
            title: true,
            level: true,
            genreUk: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            level: true,
          },
        },
      },
    });

    return res.status(201).json(session);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to save session result.",
    });
  }
});

export default router;