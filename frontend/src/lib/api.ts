import { demoSongs, type DemoSong } from "../data/demoSongs";

const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "http://localhost:4000";

const TOKEN_STORAGE_KEY = "luna_auth_token";

export type ProgressSummary = {
  totalSessions: number;
  totalScore: number;
  totalWords: number;
  totalCorrectWords: number;
  totalMistakes: number;
  totalDurationSec: number;
  bestScore: number;
  averageAccuracy: number;
};

export type SessionPayload = {
  songId: string;
  mode: string;
  score: number;
  accuracy: number;
  totalWords: number;
  correctWords: number;
  mistakes: number;
  durationSec?: number;
};

export type AssessmentAnswer = {
  questionId: string;
  selectedAnswer: string;
  correctAnswer?: string;
  isCorrect?: boolean;
};

export type AssessmentSubmitPayload = {
  answers: AssessmentAnswer[];
};

export type GenerationPreviewPayload = {
  level: string;
  style: string;
};

const emptyProgressSummary: ProgressSummary = {
  totalSessions: 0,
  totalScore: 0,
  totalWords: 0,
  totalCorrectWords: 0,
  totalMistakes: 0,
  totalDurationSec: 0,
  bestScore: 0,
  averageAccuracy: 0,
};

function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data.error === "string"
        ? data.error
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

async function getJson<T>(path: string, withAuth = false): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(withAuth ? getAuthHeaders() : {}),
    },
  });

  return readJsonResponse<T>(response);
}

async function postJson<T>(
  path: string,
  payload: unknown,
  withAuth = false
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(withAuth ? getAuthHeaders() : {}),
    },
    body: JSON.stringify(payload),
  });

  return readJsonResponse<T>(response);
}

export async function getSongs(): Promise<DemoSong[]> {
  try {
    return await getJson<DemoSong[]>("/api/songs");
  } catch (error) {
    console.warn("Using local demo songs because API failed:", error);
    return demoSongs;
  }
}

export async function getSong(songId: string): Promise<DemoSong> {
  try {
    return await getJson<DemoSong>(`/api/songs/${songId}`);
  } catch (error) {
    console.warn("Using local demo song because API failed:", error);
    return demoSongs.find((song) => song.id === songId) ?? demoSongs[0];
  }
}

export async function submitSession(payload: SessionPayload): Promise<any> {
  try {
    return await postJson<any>("/api/sessions", payload, true);
  } catch (error) {
    console.warn("Session result was not saved:", error);
    return null;
  }
}

export async function getSessionResults(): Promise<any[]> {
  try {
    return await getJson<any[]>("/api/sessions", true);
  } catch (error) {
    console.warn("Using empty session result list because API failed:", error);
    return [];
  }
}

export async function getProgressSummary(): Promise<ProgressSummary> {
  try {
    return await getJson<ProgressSummary>("/api/sessions/summary", true);
  } catch (error) {
    console.warn("Using empty progress summary because API failed:", error);
    return emptyProgressSummary;
  }
}

export async function submitAssessment(
  payload: AssessmentSubmitPayload
): Promise<any> {
  return postJson<any>("/api/assessment/submit", payload, true);
}

export async function getLatestAssessment(): Promise<any> {
  return getJson<any>("/api/assessment/latest", true);
}

export async function getGenerationOptions(): Promise<any> {
  return getJson<any>("/api/generation/options", true);
}

export async function createGenerationPreview(
  payload: GenerationPreviewPayload
): Promise<any> {
  return postJson<any>("/api/generation/preview", payload, true);
}
