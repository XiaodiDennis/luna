import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

const AUTH_SECRET = process.env.AUTH_SECRET || "luna-dev-secret";

const levels = [
  {
    level: "A1",
    label: "Початковий рівень",
    suggestion: "Дуже короткі речення, базова лексика, простий теперішній час.",
  },
  {
    level: "A2",
    label: "Базовий рівень",
    suggestion: "Прості історії, знайомі теми, базові минулі та майбутні форми.",
  },
  {
    level: "B1",
    label: "Середній рівень",
    suggestion: "Довші речення, особистий досвід, подорожі, навчання і плани.",
  },
  {
    level: "B2",
    label: "Вище середнього",
    suggestion: "Природніші формулювання, складніші зв’язки між ідеями.",
  },
  {
    level: "C1",
    label: "Просунутий рівень",
    suggestion: "Абстрактні теми, ідіоми, культурні посилання, точні відтінки значення.",
  },
  {
    level: "C2",
    label: "Вільне володіння",
    suggestion: "Складна образність, стилістична гнучкість і майже нативна складність.",
  },
];

const musicStyles = [
  "Pop Ballad",
  "Indie Folk",
  "Acoustic Pop",
  "Lo-fi",
  "Piano Ballad",
  "Classroom Chant",
  "Soft Rock",
  "Cinematic",
  "Children Song",
  "Jazz Pop",
  "Soul",
  "Spoken Word",
  "Ambient",
];

const allowedThemes = [
  "ранок",
  "місто",
  "подорож",
  "Дніпро",
  "Київ",
  "Карпати",
];

const recommendedThemeByLevel: Record<string, string> = {
  A1: "ранок",
  A2: "місто",
  B1: "подорож",
  B2: "Дніпро",
  C1: "Київ",
  C2: "Карпати",
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

function requireTeacher(req: any, res: any, next: any) {
  const token = getAuthToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      error: "Missing auth token.",
    });
  }

  const payload = verifyToken(token);

  if (!payload?.userId) {
    return res.status(401).json({
      error: "Invalid auth token.",
    });
  }

  if (payload.role !== "teacher") {
    return res.status(403).json({
      error: "AI generation tools are available only for teacher users.",
    });
  }

  req.user = payload;
  return next();
}

router.get("/options", requireTeacher, (_req, res) => {
  return res.json({
    levels,
    musicStyles,
    allowedThemes,
    recommendedThemeByLevel,
    policy: {
      userCanChooseLevel: true,
      userCanChooseStyle: true,
      userCanChooseTheme: false,
      reason:
        "Викладач може обрати рівень і музичний стиль. Тему контролює бекенд, щоб зберегти педагогічну відповідність і безпеку контенту.",
    },
  });
});

router.post("/preview", requireTeacher, (req, res) => {
  const level = String(req.body.level ?? "A2");
  const style = String(req.body.style ?? "Pop Ballad");

  const selectedLevel = levels.some((item) => item.level === level)
    ? level
    : "A2";

  const selectedStyle = musicStyles.includes(style) ? style : "Pop Ballad";

  const theme = recommendedThemeByLevel[selectedLevel] ?? "місто";

  return res.json({
    id: `teacher_preview_${Date.now()}`,
    status: "mock_preview_only",
    message:
      "Це попередній план AI-генерації для викладача. Реальна генерація музики поки не виконується.",
    selectedByUser: {
      level: selectedLevel,
      style: selectedStyle,
    },
    controlledByBackend: {
      theme,
      vocabularyLimit: "контрольована лексика відповідно до рівня учнів",
      grammarFocus: ["sentence practice", "listening", "typing", "teacher review"],
      lineCount: 12,
      safetyReviewRequired: true,
      editorialReviewRequired: true,
      pedagogicalReviewRequired: true,
    },
    plannedSong: {
      workingTitle: `${theme} · ${selectedStyle}`,
      learnerLevel: selectedLevel,
      interfaceLanguage: "Українська",
      learningLanguage: "Англійська",
      expectedOutput:
        "Оригінальна англомовна пісня з українськими поясненнями та вправою для учнів.",
    },
  });
});

export default router;