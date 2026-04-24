import { demoSongs, type DemoSong } from "../data/demoSongs";

const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "http://localhost:4000";

export async function getSongs(): Promise<DemoSong[]> {
  try {
    const response = await fetch(`${API_BASE}/api/songs`);

    if (!response.ok) {
      throw new Error(`Failed to fetch songs: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Using local demo songs because API failed:", error);
    return demoSongs;
  }
}

export async function getSong(songId: string): Promise<DemoSong> {
  try {
    const response = await fetch(`${API_BASE}/api/songs/${songId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch song: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Using local demo song because API failed:", error);
    return demoSongs.find((song) => song.id === songId) ?? demoSongs[0];
  }
}

export async function submitSession(payload: {
  songId: string;
  mode: string;
  score: number;
  accuracy: number;
  totalWords: number;
  correctWords: number;
  mistakes: number;
  durationSec?: number;
}) {
  try {
    const response = await fetch(`${API_BASE}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit session: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Session result was not saved:", error);
    return null;
  }
}

export async function getSessionResults() {
  try {
    const response = await fetch(`${API_BASE}/api/sessions`);

    if (!response.ok) {
      throw new Error(`Failed to fetch session results: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Using empty session result list because API failed:", error);
    return [];
  }
}

export async function getProgressSummary() {
  try {
    const response = await fetch(`${API_BASE}/api/sessions/summary`);

    if (!response.ok) {
      throw new Error(`Failed to fetch progress summary: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Using empty progress summary because API failed:", error);
    return {
      totalSessions: 0,
      totalScore: 0,
      totalWords: 0,
      totalCorrectWords: 0,
      totalMistakes: 0,
      totalDurationSec: 0,
      bestScore: 0,
      averageAccuracy: 0,
    };
  }
}

export async function getGenerationOptions() {
  try {
    const response = await fetch(`${API_BASE}/api/generation/options`);

    if (!response.ok) {
      throw new Error(`Failed to fetch generation options: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Using local generation options because API failed:", error);

    return {
      levels: [
        {
          level: "A1",
          label: "Початковий рівень",
          suggestion: "Дуже короткі рядки, Present Simple, щоденні предмети.",
        },
        {
          level: "A2",
          label: "Базовий рівень",
          suggestion:
            "Прості історії, базовий минулий час, подорожі та міське життя.",
        },
        {
          level: "B1",
          label: "Середній рівень",
          suggestion: "Довші речення, емоції, спогади та особисті плани.",
        },
        {
          level: "B2",
          label: "Вище середнього",
          suggestion:
            "Більш природні тексти, фразові дієслова, абстрактні ідеї.",
        },
        {
          level: "C1",
          label: "Просунутий рівень",
          suggestion: "Складні образи, ідіоми, культурні посилання.",
        },
        {
          level: "C2",
          label: "Вільне володіння",
          suggestion: "Поетична мова, тонкі відтінки значення, складна лексика.",
        },
      ],
      musicStyles: ["Acoustic Pop", "Indie Folk", "Country", "Pop Ballad"],
      allowedThemes: ["ранок", "місто", "подорож", "Дніпро", "Київ", "Карпати"],
      recommendedThemeByLevel: {
        A1: "ранок",
        A2: "місто",
        B1: "подорож",
        B2: "Дніпро",
        C1: "Київ",
        C2: "Карпати",
      },
      policy: {
        userCanChooseLevel: true,
        userCanChooseStyle: true,
        userCanChooseTheme: false,
        reason:
          "Учень може обрати рівень і стиль музики. Тему контролює бекенд.",
      },
    };
  }
}

export async function createGenerationPreview(payload: {
  level: string;
  style: string;
}) {
  try {
    const response = await fetch(`${API_BASE}/api/generation/preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to create generation preview: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Using local generation preview because API failed:", error);

    const themeByLevel: Record<string, string> = {
      A1: "ранок",
      A2: "місто",
      B1: "подорож",
      B2: "Дніпро",
      C1: "Київ",
      C2: "Карпати",
    };

    return {
      id: `local_mock_${Date.now()}`,
      status: "mock_preview_only",
      message:
        "Це локальний попередній план. Реальна генерація музики поки не виконується.",
      selectedByUser: {
        level: payload.level,
        style: payload.style,
      },
      controlledByBackend: {
        theme: themeByLevel[payload.level] ?? "місто",
        vocabularyLimit: "контрольована лексика відповідно до рівня",
        grammarFocus: ["sentence practice", "listening", "typing"],
        lineCount: 12,
        safetyReviewRequired: true,
        editorialReviewRequired: true,
        pedagogicalReviewRequired: true,
      },
      plannedSong: {
        workingTitle: `${themeByLevel[payload.level] ?? "місто"} · ${
          payload.style
        }`,
        learnerLevel: payload.level,
        interfaceLanguage: "Українська",
        learningLanguage: "Англійська",
        expectedOutput:
          "Оригінальна англомовна пісня з українськими поясненнями та вправою.",
      },
    };
  }
}
