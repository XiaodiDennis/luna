import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProgressSummary, getSessionResults } from "../lib/api";
import { LogoLink } from "../components/LogoLink";

type ProgressSummary = {
  totalSessions: number;
  totalScore: number;
  totalWords: number;
  totalCorrectWords: number;
  totalMistakes: number;
  totalDurationSec: number;
  bestScore: number;
  averageAccuracy: number;
};

type SessionResult = {
  id: string;
  songId: string;
  mode: string;
  score: number;
  accuracy: number;
  totalWords: number;
  correctWords: number;
  mistakes: number;
  durationSec: number | null;
  createdAt: string;
  song?: {
    id: string;
    title: string;
    level: string;
    genreUk: string;
  };
};

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} с`;
  }

  return `${minutes} хв ${seconds} с`;
}

export function ProgressPage() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [sessions, setSessions] = useState<SessionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProgressSummary(), getSessionResults()])
      .then(([summaryData, sessionData]) => {
        setSummary(summaryData);
        setSessions(Array.isArray(sessionData) ? sessionData : []);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="h-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
          <LogoLink />

          <nav className="flex items-center gap-8 text-sm font-medium">
            <Link to="/songs" className="hover:text-sky-600">
              Демо-пісні
            </Link>
            <Link to="/generate" className="hover:text-sky-600">
              AI-генерація
            </Link>
            <Link to="/design" className="hover:text-sky-600">
              Про продукт
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
            Навчальний прогрес
          </p>

          <h1 className="mt-3 text-5xl font-black tracking-tight">
            Результати тренувань
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Ця сторінка показує повний full-stack цикл: користувач проходить
            музичну вправу, фронтенд надсилає результат, бекенд зберігає його
            в базі даних, а тут відображається історія прогресу.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 text-slate-500">
            Завантаження прогресу...
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Завершені сесії"
                value={String(summary?.totalSessions ?? 0)}
              />
              <StatCard
                label="Середня точність"
                value={`${summary?.averageAccuracy ?? 0}%`}
              />
              <StatCard
                label="Найкращий бал"
                value={String(summary?.bestScore ?? 0)}
              />
              <StatCard
                label="Загальний час"
                value={formatDuration(summary?.totalDurationSec ?? 0)}
              />
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <StatCard
                label="Усього балів"
                value={String(summary?.totalScore ?? 0)}
              />
              <StatCard
                label="Правильних слів"
                value={String(summary?.totalCorrectWords ?? 0)}
              />
              <StatCard
                label="Помилок"
                value={String(summary?.totalMistakes ?? 0)}
              />
            </div>

            <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Останні тренування</h2>
                  <p className="mt-2 text-slate-500">
                    Показуються останні 30 збережених результатів.
                  </p>
                </div>

                <Link
                  to="/songs"
                  className="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-600"
                >
                  Пройти ще одну пісню
                </Link>
              </div>

              {sessions.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <h3 className="text-xl font-bold">Поки що немає результатів</h3>
                  <p className="mx-auto mt-3 max-w-xl text-slate-600">
                    Заверши хоча б одну пісню, і тут з’явиться історія
                    тренувань. Для швидкого тесту можна пройти пісню через
                    кнопку «Пропустити рядок».
                  </p>
                </div>
              ) : (
                <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-7 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-600">
                    <div className="col-span-2">Пісня</div>
                    <div>Рівень</div>
                    <div>Бал</div>
                    <div>Точність</div>
                    <div>Помилки</div>
                    <div>Дата</div>
                  </div>

                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="grid grid-cols-7 border-t border-slate-200 px-5 py-4 text-sm"
                    >
                      <div className="col-span-2 font-semibold">
                        {session.song?.title ?? session.songId}
                      </div>
                      <div className="text-slate-600">
                        {session.song?.level ?? "—"}
                      </div>
                      <div className="font-bold text-sky-600">
                        {session.score}
                      </div>
                      <div>{session.accuracy}%</div>
                      <div>{session.mistakes}</div>
                      <div className="text-slate-500">
                        {new Date(session.createdAt).toLocaleDateString("uk-UA")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-black text-slate-950">{value}</div>
    </div>
  );
}
