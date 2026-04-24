import { Router } from "express";

export const generationRouter = Router();

const levels = [
  {
    level: "A1",
    label: "Початковий рівень",
    suggestion: "Дуже короткі рядки, Present Simple, щоденні предмети.",
  },
  {
    level: "A2",
    label: "Базовий рівень",
    suggestion: "Прості історії, базовий минулий час, подорожі та міське життя.",
  },
  {
    level: "B1",
    label: "Середній рівень",
    suggestion: "Довші речення, емоції, спогади та особисті плани.",
  },
  {
    level: "B2",
    label: "Вище середнього",
    suggestion: "Більш природні тексти, фразові дієслова, абстрактні ідеї.",
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
];

const musicStyles = [
  "Acoustic Pop",
  "Indie Folk",
  "Country",
  "Pop Ballad",
  "Synth Pop",
  "Dream Pop",
  "Soft Rock",
  "Lo-fi",
  "Jazz Pop",
  "Soul",
  "R&B",
  "Piano Ballad",
  "Ukulele Pop",
  "Children's Song",
  "Classroom Chant",
  "Musical Theatre",
  "EDM Pop",
  "House",
  "Disco Pop",
  "Reggae Pop",
  "Latin Pop",
  "Afro Pop",
  "Orchestral Pop",
  "Cinematic",
  "Ambient",
  "Folk Rock",
  "Bluegrass",
  "Teen Pop",
  "Euro Pop",
  "City Pop",
  "Soft Rap",
  "Spoken Word",
  "Holiday Song",
  "Travel Song",
];

const allowedThemes = [
  "Карпати",
  "Дніпро",
  "Львів",
  "Київ",
  "Одеса",
  "школа",
  "подорож",
  "погода",
  "місто",
  "кава",
  "ранок",
  "вечір",
];

const recommendedThemeByLevel: Record<string, string> = {
  A1: "ранок",
  A2: "місто",
  B1: "подорож",
  B2: "Дніпро",
  C1: "Київ",
  C2: "Карпати",
};

function getLineCountByLevel(level: string) {
  if (level === "A1") return 8;
  if (level === "A2") return 12;
  if (level === "B1") return 16;
  if (level === "B2") return 20;
  return 24;
}

function getVocabularyLimitByLevel(level: string) {
  if (level === "A1") return "дуже проста базова лексика";
  if (level === "A2") return "проста лексика з базовими дієсловами";
  if (level === "B1") return "повсякденна лексика з емоціями та спогадами";
  if (level === "B2") return "природні фрази, фразові дієслова та образність";
  if (level === "C1") return "складніші формулювання, ідіоми та культурні натяки";
  return "поетична лексика, тонкі відтінки значення та складний синтаксис";
}

function getGrammarFocusByLevel(level: string) {
  if (level === "A1") return ["Present Simple", "to be", "basic nouns"];
  if (level === "A2") return ["Past Simple", "basic adjectives", "prepositions of place"];
  if (level === "B1") return ["Present Perfect", "future plans", "because / when clauses"];
  if (level === "B2") return ["phrasal verbs", "conditionals", "relative clauses"];
  if (level === "C1") return ["idiomatic expressions", "modality", "complex clauses"];
  return ["nuance", "metaphor", "advanced discourse markers"];
}

generationRouter.get("/options", (_req, res) => {
  res.json({
    levels,
    musicStyles,
    allowedThemes,
    recommendedThemeByLevel,
    policy: {
      userCanChooseLevel: true,
      userCanChooseStyle: true,
      userCanChooseTheme: false,
      reason:
        "Учень може обрати рівень і стиль музики. Тему, безпеку словника, відповідність віку та культурні посилання контролює бекенд.",
    },
  });
});

generationRouter.post("/preview", (req, res) => {
  const requestedLevel = String(req.body.level ?? "A2");
  const requestedStyle = String(req.body.style ?? "Pop Ballad");

  const safeLevel = levels.some((item) => item.level === requestedLevel)
    ? requestedLevel
    : "A2";

  const safeStyle = musicStyles.includes(requestedStyle)
    ? requestedStyle
    : "Pop Ballad";

  const backendTheme = recommendedThemeByLevel[safeLevel] ?? "місто";
  const levelInfo = levels.find((item) => item.level === safeLevel) ?? levels[1];

  res.json({
    id: `mock_${Date.now()}`,
    status: "mock_preview_only",
    message:
      "Це лише попередній план генерації. Реальна генерація музики, тексту та аудіо поки не виконується.",
    selectedByUser: {
      level: safeLevel,
      style: safeStyle,
    },
    controlledByBackend: {
      theme: backendTheme,
      allowedThemes,
      vocabularyLimit: getVocabularyLimitByLevel(safeLevel),
      grammarFocus: getGrammarFocusByLevel(safeLevel),
      lineCount: getLineCountByLevel(safeLevel),
      safetyReviewRequired: true,
      editorialReviewRequired: true,
      pedagogicalReviewRequired: true,
    },
    plannedSong: {
      workingTitle: `${backendTheme} · ${safeStyle}`,
      learnerLevel: levelInfo.label,
      interfaceLanguage: "Українська",
      learningLanguage: "Англійська",
      expectedOutput:
        "Оригінальна англомовна пісня з українськими поясненнями, таймлайном рядків, словниковими одиницями та вправою на введення слів.",
    },
  });
});
