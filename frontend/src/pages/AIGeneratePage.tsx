import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createGenerationPreview, getGenerationOptions } from "../lib/api";

type EnglishLevelOption = {
  level: string;
  label: string;
  suggestion: string;
};

type GenerationOptions = {
  levels: EnglishLevelOption[];
  musicStyles: string[];
  allowedThemes: string[];
  recommendedThemeByLevel: Record<string, string>;
  policy: {
    userCanChooseLevel: boolean;
    userCanChooseStyle: boolean;
    userCanChooseTheme: boolean;
    reason: string;
  };
};

type GenerationPreview = {
  id: string;
  status: string;
  message: string;
  selectedByUser: {
    level: string;
    style: string;
  };
  controlledByBackend: {
    theme: string;
    vocabularyLimit: string;
    grammarFocus: string[];
    lineCount: number;
    safetyReviewRequired: boolean;
    editorialReviewRequired: boolean;
    pedagogicalReviewRequired: boolean;
  };
  plannedSong: {
    workingTitle: string;
    learnerLevel: string;
    interfaceLanguage: string;
    learningLanguage: string;
    expectedOutput: string;
  };
};

function getStyleSuggestion(style: string) {
  if (style.includes("Children") || style.includes("Classroom")) {
    return "Найкраще підходить для рівнів A1-A2 та занять у класі.";
  }

  if (style.includes("Pop") || style.includes("Ballad")) {
    return "Добрий універсальний вибір для рівнів A2-B2.";
  }

  if (style.includes("Jazz") || style.includes("Soul") || style.includes("Spoken")) {
    return "Краще підходить для рівнів B2-C2, бо ритм і формулювання можуть бути складнішими.";
  }

  if (style.includes("Cinematic") || style.includes("Ambient")) {
    return "Добре підходить для сюжетних пісень, але може потребувати повільнішого темпу тексту.";
  }

  return "Може використовуватися для більшості рівнів, якщо лексика контролюється.";
}

export function AIGeneratePage() {
  const [options, setOptions] = useState<GenerationOptions | null>(null);
  const [selectedLevel, setSelectedLevel] = useState("A2");
  const [selectedStyle, setSelectedStyle] = useState("Pop Ballad");
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<GenerationPreview | null>(null);

  useEffect(() => {
    let isMounted = true;

    getGenerationOptions()
      .then((data: GenerationOptions) => {
        if (!isMounted) return;

        setOptions(data);

        if (data.levels.length > 0) {
          const hasA2 = data.levels.some((item) => item.level === "A2");
          setSelectedLevel(hasA2 ? "A2" : data.levels[0].level);
        }

        if (data.musicStyles.length > 0) {
          const hasPopBallad = data.musicStyles.includes("Pop Ballad");
          setSelectedStyle(hasPopBallad ? "Pop Ballad" : data.musicStyles[0]);
        }
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedLevelInfo = useMemo(() => {
    return options?.levels.find((item) => item.level === selectedLevel);
  }, [options, selectedLevel]);

  const lockedTheme = useMemo(() => {
    if (!options) return "місто";
    return options.recommendedThemeByLevel[selectedLevel] ?? options.allowedThemes[0] ?? "місто";
  }, [options, selectedLevel]);

  const styleSuggestion = useMemo(() => {
    return getStyleSuggestion(selectedStyle);
  }, [selectedStyle]);

  async function handleCreatePreview() {
    setIsPreviewLoading(true);

    const result = await createGenerationPreview({
      level: selectedLevel,
      style: selectedStyle,
    });

    setPreview(result);
    setIsPreviewLoading(false);
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Завантаження налаштувань генерації...
      </main>
    );
  }

  if (!options) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Не вдалося завантажити налаштування</h1>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white"
          >
            На головну
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="h-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
          <Link to="/" className="text-2xl font-bold">
            Луна
          </Link>

          <nav className="flex items-center gap-8 text-sm font-medium">
            <Link to="/design" className="hover:text-sky-600">
              Про продукт
            </Link>

            <Link to="/songs" className="hover:text-sky-600">
              Демо-пісні
            </Link>

            <Link
              to="/songs"
              className="rounded-xl bg-sky-500 px-5 py-3 text-white shadow-sm hover:bg-sky-600"
            >
              Грати
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto flex max-w-7xl flex-col items-center px-8 py-14">
        <div className="max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
            ШІ-генерація музики
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight md:text-6xl">
            Спроєктуй навчальну пісню для свого рівня англійської
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Це full-stack макет генерації без витрат API-токенів. Учень обирає
            рівень і музичний стиль, а бекенд повертає контрольовану тему,
            навчальні обмеження та план майбутньої пісні.
          </p>
        </div>

        <div className="mt-12 grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-center">
              <h2 className="text-2xl font-bold">1. Обери рівень англійської</h2>
              <p className="mt-2 text-slate-500">
                Луна налаштовує лексику, довжину речень і складність граматики.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {options.levels.map((item) => (
                <button
                  key={item.level}
                  onClick={() => {
                    setSelectedLevel(item.level);
                    setPreview(null);
                  }}
                  className={
                    selectedLevel === item.level
                      ? "rounded-2xl border border-sky-400 bg-sky-50 p-4 text-left shadow-sm"
                      : "rounded-2xl border border-slate-200 bg-white p-4 text-left hover:bg-slate-50"
                  }
                >
                  <div className="text-lg font-bold text-slate-950">
                    {item.level}
                  </div>

                  <div className="mt-1 text-sm font-semibold text-sky-600">
                    {item.label}
                  </div>

                  <div className="mt-2 text-sm leading-6 text-slate-500">
                    {item.suggestion}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-10 text-center">
              <h2 className="text-2xl font-bold">2. Обери музичний стиль</h2>
              <p className="mt-2 text-slate-500">
                Назви стилів залишаються англійською, бо це стандартні музичні жанри.
              </p>
            </div>

            <div className="mt-6 grid max-h-[360px] gap-3 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-3">
              {options.musicStyles.map((style) => (
                <button
                  key={style}
                  onClick={() => {
                    setSelectedStyle(style);
                    setPreview(null);
                  }}
                  className={
                    selectedStyle === style
                      ? "rounded-2xl border border-sky-400 bg-sky-50 px-4 py-3 text-left font-semibold text-sky-700"
                      : "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left font-semibold text-slate-700 hover:bg-slate-50"
                  }
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
              <div className="text-lg font-bold">
                3. Тема контролюється бекендом
              </div>

              <p className="mt-2 leading-7">
                Користувач не може вводити тему самостійно. Для рівня{" "}
                <strong>{selectedLevel}</strong> бекенд автоматично обирає тему:
                <span className="ml-2 rounded-lg bg-white px-3 py-1 font-bold">
                  {lockedTheme}
                </span>
              </p>

              <p className="mt-3 text-sm leading-6">
                Дозволені теми: {options.allowedThemes.join(", ")}.
              </p>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleCreatePreview}
                disabled={isPreviewLoading}
                className="rounded-xl bg-sky-500 px-8 py-4 font-semibold text-white shadow-md hover:bg-sky-600 disabled:bg-slate-300"
              >
                {isPreviewLoading ? "Створення плану..." : "Створити план генерації"}
              </button>
            </div>
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-center text-2xl font-bold">
              Попередній перегляд
            </h2>

            <div className="mt-6 space-y-4 text-slate-700">
              <PreviewRow label="Рівень" value={selectedLevel} />
              <PreviewRow
                label="Пояснення рівня"
                value={selectedLevelInfo?.label ?? ""}
              />
              <PreviewRow label="Музичний стиль" value={selectedStyle} />
              <PreviewRow label="Тема" value={lockedTheme} />
              <PreviewRow label="Мова інтерфейсу" value="Українська" />
              <PreviewRow label="Мова навчання" value="Англійська" />
            </div>

            <div className="mt-8 rounded-2xl bg-slate-950 p-6 text-sm leading-7 text-slate-200">
              <p className="font-semibold text-sky-300">
                Рекомендація щодо стилю
              </p>
              <p className="mt-2">{styleSuggestion}</p>

              <p className="mt-6 font-semibold text-sky-300">
                Рекомендація щодо рівня англійської
              </p>
              <p className="mt-2">{selectedLevelInfo?.suggestion}</p>

              <p className="mt-6 font-semibold text-sky-300">
                Правило бекенду
              </p>
              <p className="mt-2">{options.policy.reason}</p>
            </div>

            {preview && (
              <div className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-slate-800">
                <p className="text-lg font-bold">План генерації створено</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {preview.message}
                </p>

                <div className="mt-5 space-y-3 text-sm">
                  <SummaryRow label="Робоча назва" value={preview.plannedSong.workingTitle} />
                  <SummaryRow label="Рівень" value={preview.selectedByUser.level} />
                  <SummaryRow label="Стиль" value={preview.selectedByUser.style} />
                  <SummaryRow label="Тема з бекенду" value={preview.controlledByBackend.theme} />
                  <SummaryRow
                    label="Лексичне обмеження"
                    value={preview.controlledByBackend.vocabularyLimit}
                  />
                  <SummaryRow
                    label="Кількість рядків"
                    value={`${preview.controlledByBackend.lineCount}`}
                  />
                </div>

                <div className="mt-5 rounded-xl bg-white p-4 text-sm leading-6">
                  <div className="font-semibold">Граматичний фокус</div>
                  <div className="mt-2 text-slate-600">
                    {preview.controlledByBackend.grammarFocus.join(", ")}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                  <StatusBadge label="Редакційна перевірка" active={preview.controlledByBackend.editorialReviewRequired} />
                  <StatusBadge label="Педагогічна перевірка" active={preview.controlledByBackend.pedagogicalReviewRequired} />
                  <StatusBadge label="Безпека контенту" active={preview.controlledByBackend.safetyReviewRequired} />
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-white px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[55%] text-right font-semibold">{value}</span>
    </div>
  );
}

function StatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={
        active
          ? "rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center font-semibold text-emerald-700"
          : "rounded-xl border border-slate-200 bg-white p-3 text-center font-semibold text-slate-500"
      }
    >
      {label}
    </div>
  );
}
