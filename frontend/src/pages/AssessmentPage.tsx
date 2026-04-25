import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { LogoLink } from "../components/LogoLink";
import { useAuth, type LunaUser } from "../lib/auth";

const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "http://localhost:4000";

type AssessmentQuestion = {
  id: string;
  instruction: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
};

type AssessmentSubmitResponse = {
  result: {
    id: string;
    score: number;
    level: string;
    createdAt: string;
    correctCount: number;
    totalCount: number;
  };
  user: LunaUser;
};

const questions: AssessmentQuestion[] = [
  {
    id: "q1",
    instruction: "Обери правильне слово.",
    prompt: "I ___ a student.",
    options: ["am", "is", "are", "be"],
    correctAnswer: "am",
  },
  {
    id: "q2",
    instruction: "Обери правильне слово.",
    prompt: "She ___ English every day.",
    options: ["study", "studies", "studying", "studied"],
    correctAnswer: "studies",
  },
  {
    id: "q3",
    instruction: "Обери правильний варіант.",
    prompt: "Yesterday, we ___ to the park.",
    options: ["go", "goes", "went", "going"],
    correctAnswer: "went",
  },
  {
    id: "q4",
    instruction: "Обери правильне речення.",
    prompt: "Which sentence is correct?",
    options: [
      "He don't like coffee.",
      "He doesn't like coffee.",
      "He doesn't likes coffee.",
      "He not like coffee.",
    ],
    correctAnswer: "He doesn't like coffee.",
  },
  {
    id: "q5",
    instruction: "Обери правильний варіант.",
    prompt: "I have lived here ___ 2020.",
    options: ["for", "since", "during", "from"],
    correctAnswer: "since",
  },
  {
    id: "q6",
    instruction: "Обери найближче значення.",
    prompt: "The word “quickly” means:",
    options: ["slowly", "fast", "quiet", "late"],
    correctAnswer: "fast",
  },
  {
    id: "q7",
    instruction: "Обери правильний порядок слів.",
    prompt: "Make a correct question.",
    options: [
      "Where you are going?",
      "Where are you going?",
      "Where going are you?",
      "Where you going are?",
    ],
    correctAnswer: "Where are you going?",
  },
  {
    id: "q8",
    instruction: "Обери правильний варіант.",
    prompt: "If I had more time, I ___ more books.",
    options: ["read", "will read", "would read", "am reading"],
    correctAnswer: "would read",
  },
  {
    id: "q9",
    instruction: "Обери правильне слово.",
    prompt: "The meeting was cancelled ___ the bad weather.",
    options: ["because", "because of", "although", "despite"],
    correctAnswer: "because of",
  },
  {
    id: "q10",
    instruction: "Обери правильний варіант.",
    prompt: "By the time we arrived, the film ___.",
    options: ["started", "has started", "had started", "was starting"],
    correctAnswer: "had started",
  },
  {
    id: "q11",
    instruction: "Обери найбільш природний варіант.",
    prompt: "I’m looking forward ___ you.",
    options: ["to see", "seeing", "to seeing", "see"],
    correctAnswer: "to seeing",
  },
  {
    id: "q12",
    instruction: "Обери найточніше значення.",
    prompt: "“Despite the difficulties, she carried on.” means:",
    options: [
      "She stopped because it was difficult.",
      "She continued although it was difficult.",
      "She forgot the difficulties.",
      "She avoided the situation.",
    ],
    correctAnswer: "She continued although it was difficult.",
  },
];

export function AssessmentPage() {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [result, setResult] =
    useState<AssessmentSubmitResponse["result"] | null>(null);

  const answeredCount = useMemo(() => {
    return questions.filter((question) => answers[question.id]).length;
  }, [answers]);

  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  function selectAnswer(questionId: string, selectedAnswer: string) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: selectedAnswer,
    }));
  }

  async function submitAssessment() {
    setErrorText("");

    if (!token) {
      setErrorText("Потрібно увійти в акаунт перед проходженням тесту.");
      return;
    }

    if (answeredCount < questions.length) {
      setErrorText("Дай відповідь на всі питання перед завершенням тесту.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/assessment/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: questions.map((question) => ({
            questionId: question.id,
            selectedAnswer: answers[question.id],
            correctAnswer: question.correctAnswer,
          })),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Не вдалося зберегти результат тесту.");
      }

      const typedData = data as AssessmentSubmitResponse;

      updateUser(typedData.user);
      setResult(typedData.result);
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Не вдалося завершити тест."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (user?.role === "teacher") {
    return <Navigate to="/teacher-dashboard" replace />;
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <header className="h-20 border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
            <LogoLink />

            <Link
              to="/login"
              className="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-600"
            >
              Увійти
            </Link>
          </div>
        </header>

        <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-3xl flex-col items-center justify-center px-8 text-center">
          <h1 className="text-4xl font-black">Потрібен вхід</h1>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            Щоб пройти оцінювання рівня, потрібно увійти або створити акаунт
            учня.
          </p>

          <Link
            to="/login"
            className="mt-8 rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600"
          >
            Перейти до входу
          </Link>
        </section>
      </main>
    );
  }

  if (result) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <header className="h-20 border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
            <LogoLink />

            <Link
              to="/student-dashboard"
              className="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-600"
            >
              Кабінет учня
            </Link>
          </div>
        </header>

        <section className="mx-auto flex max-w-4xl flex-col items-center px-8 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Результат оцінювання
          </p>

          <h1 className="mt-4 text-6xl font-black">{result.level}</h1>

          <p className="mt-5 text-xl text-slate-600">
            Твій результат:{" "}
            <span className="font-bold text-slate-950">{result.score}%</span>
          </p>

          <p className="mt-3 text-slate-500">
            Правильних відповідей: {result.correctCount} / {result.totalCount}
          </p>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm">
            <h2 className="text-2xl font-black">Що це означає?</h2>

            <p className="mt-4 leading-8 text-slate-600">
              Система зберегла твій приблизний рівень англійської. Далі Луна
              може використовувати цей рівень для рекомендації пісень, завдань
              і складності вправ.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/student-dashboard")}
            className="mt-10 rounded-xl bg-sky-500 px-8 py-4 font-semibold text-white hover:bg-sky-600"
          >
            Перейти до кабінету учня
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="h-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
          <LogoLink />

          <Link
            to="/student-dashboard"
            className="text-sm font-semibold text-slate-500 hover:text-sky-600"
          >
            Кабінет учня
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-8 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
          Оцінювання рівня англійської
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Короткий тест для визначення рівня
        </h1>

        <p className="mt-5 text-lg leading-8 text-slate-600">
          Дай відповідь на 12 питань. Після завершення система приблизно
          визначить твій рівень від A1 до C2.
        </p>

        <div className="mt-8 rounded-full bg-slate-200">
          <div
            className="h-3 rounded-full bg-sky-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-slate-500">
          Відповіді: {answeredCount} / {questions.length}
        </p>

        <div className="mt-10 space-y-6">
          {questions.map((question, index) => (
            <article
              key={question.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-sm font-semibold text-sky-600">
                Питання {index + 1}
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {question.instruction}
              </p>

              <h2 className="mt-4 text-2xl font-black">{question.prompt}</h2>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectAnswer(question.id, option)}
                      className={
                        isSelected
                          ? "rounded-2xl border-2 border-sky-500 bg-sky-50 p-4 text-left font-semibold text-sky-800"
                          : "rounded-2xl border border-slate-200 bg-white p-4 text-left font-semibold text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                      }
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        {errorText && (
          <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-700">
            {errorText}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={submitAssessment}
            disabled={isSubmitting}
            className="rounded-xl bg-sky-500 px-8 py-4 font-semibold text-white shadow-md hover:bg-sky-600 disabled:bg-slate-300"
          >
            {isSubmitting ? "Збереження..." : "Завершити оцінювання"}
          </button>
        </div>
      </section>
    </main>
  );
}