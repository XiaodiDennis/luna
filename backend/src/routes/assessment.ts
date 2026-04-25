import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const router = Router();

const AUTH_SECRET = process.env.AUTH_SECRET || "luna-dev-secret";

type AssessmentAnswer = {
  questionId: string;
  selectedAnswer: string;
  correctAnswer?: string;
  isCorrect?: boolean;
};

function getAuthToken(headerValue: string | undefined) {
  if (!headerValue) return null;

  const [type, token] = headerValue.split(" ");

  if (type !== "Bearer" || !token) return null;

  return token;
}

function verifyToken(token: string) {
  try {
    return jwt.verify(token, AUTH_SECRET) as {
      userId: string;
      role?: string;
    };
  } catch {
    return null;
  }
}

async function getCurrentUserId(authorizationHeader: string | undefined) {
  const token = getAuthToken(authorizationHeader);

  if (!token) return null;

  const payload = verifyToken(token);

  if (!payload?.userId) return null;

  return payload.userId;
}

function calculateLevel(scorePercent: number) {
  if (scorePercent <= 20) return "A1";
  if (scorePercent <= 40) return "A2";
  if (scorePercent <= 60) return "B1";
  if (scorePercent <= 75) return "B2";
  if (scorePercent <= 90) return "C1";
  return "C2";
}

function normalizeAnswers(rawAnswers: unknown): AssessmentAnswer[] {
  if (!Array.isArray(rawAnswers)) return [];

  return rawAnswers.map((answer, index) => {
    const value = answer as Partial<AssessmentAnswer>;

    return {
      questionId: String(value.questionId ?? `q_${index + 1}`),
      selectedAnswer: String(value.selectedAnswer ?? ""),
      correctAnswer:
        value.correctAnswer === undefined
          ? undefined
          : String(value.correctAnswer),
      isCorrect:
        typeof value.isCorrect === "boolean" ? value.isCorrect : undefined,
    };
  });
}

function calculateScoreFromAnswers(answers: AssessmentAnswer[]) {
  if (answers.length === 0) {
    return {
      correctCount: 0,
      totalCount: 0,
      scorePercent: 0,
    };
  }

  const correctCount = answers.filter((answer) => {
    if (typeof answer.isCorrect === "boolean") {
      return answer.isCorrect;
    }

    if (answer.correctAnswer === undefined) {
      return false;
    }

    return (
      answer.selectedAnswer.trim().toLowerCase() ===
      answer.correctAnswer.trim().toLowerCase()
    );
  }).length;

  const totalCount = answers.length;
  const scorePercent = Math.round((correctCount / totalCount) * 100);

  return {
    correctCount,
    totalCount,
    scorePercent,
  };
}

router.post("/submit", async (req, res) => {
  try {
    const userId = await getCurrentUserId(req.headers.authorization);

    if (!userId) {
      return res.status(401).json({
        error: "Missing or invalid auth token.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    if (user.role !== "student") {
      return res.status(403).json({
        error: "Only student users need to complete assessment.",
      });
    }

    const answers = normalizeAnswers(req.body.answers);

    if (answers.length === 0) {
      return res.status(400).json({
        error: "Assessment answers are required.",
      });
    }

    const { correctCount, totalCount, scorePercent } =
      calculateScoreFromAnswers(answers);

    const level = calculateLevel(scorePercent);

    const assessmentResult = await prisma.assessmentResult.create({
      data: {
        userId,
        score: scorePercent,
        level,
        answersJson: JSON.stringify({
          answers,
          correctCount,
          totalCount,
          scorePercent,
        }),
      },
    });

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        level,
        assessmentDone: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        level: true,
        assessmentDone: true,
        createdAt: true,
      },
    });

    return res.json({
      result: {
        id: assessmentResult.id,
        score: assessmentResult.score,
        level: assessmentResult.level,
        createdAt: assessmentResult.createdAt,
        correctCount,
        totalCount,
      },
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to submit assessment.",
    });
  }
});

router.get("/latest", async (req, res) => {
  try {
    const userId = await getCurrentUserId(req.headers.authorization);

    if (!userId) {
      return res.status(401).json({
        error: "Missing or invalid auth token.",
      });
    }

    const latestResult = await prisma.assessmentResult.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      result: latestResult,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to load assessment result.",
    });
  }
});

export default router;