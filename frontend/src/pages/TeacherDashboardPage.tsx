import { Link } from "react-router-dom";
import { LogoLink } from "../components/LogoLink";
import { useAuth } from "../lib/auth";

export function TeacherDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="h-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
          <LogoLink />

          <nav className="flex items-center gap-6 text-sm font-semibold">
            <Link to="/generate" className="hover:text-sky-600">
              AI-інструменти
            </Link>

            <Link to="/songs" className="hover:text-sky-600">
              Пісні
            </Link>

            <button onClick={logout} className="hover:text-sky-600">
              Вийти
            </button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-8 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
          Кабінет викладача
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Привіт, {user?.name ?? "викладачу"}
        </h1>

        <p className="mt-5 text-lg leading-8 text-slate-600">
          Тут буде панель для аналізу результатів кількох учнів, перегляду
          слабких місць, точності виконання та рекомендацій щодо наступних
          матеріалів.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <StatCard title="Учні" value="0" text="Підключені учні" />
          <StatCard title="Середня точність" value="—" text="Після занять" />
          <StatCard title="AI-матеріали" value="Teacher" text="Доступ викладача" />
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black">AI-генерація для викладача</h2>

          <p className="mt-4 leading-7 text-slate-600">
            AI-функціональність призначена для викладачів. Учні можуть
            тренуватися з готовими або призначеними матеріалами, але не мають
            самостійно керувати темами генерації.
          </p>

          <Link
            to="/generate"
            className="mt-6 inline-flex rounded-xl bg-sky-500 px-6 py-4 font-semibold text-white hover:bg-sky-600"
          >
            Відкрити AI-інструменти
          </Link>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  text,
}: {
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-500">{title}</div>
      <div className="mt-3 text-4xl font-black">{value}</div>
      <div className="mt-2 text-slate-500">{text}</div>
    </div>
  );
}