import { Link } from "react-router-dom";
import { LogoLink } from "../components/LogoLink";
import { useAuth } from "../lib/auth";

export function StudentDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="h-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
          <LogoLink />

          <nav className="flex items-center gap-6 text-sm font-semibold">
            <Link to="/songs" className="hover:text-sky-600">
              Пісні
            </Link>

            <Link to="/progress" className="hover:text-sky-600">
              Прогрес
            </Link>

            <button onClick={logout} className="hover:text-sky-600">
              Вийти
            </button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-8 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
          Кабінет учня
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Привіт, {user?.name ?? "учню"}
        </h1>

        <p className="mt-5 text-lg text-slate-600">
          Твій поточний рівень:{" "}
          <span className="font-bold text-slate-900">
            {user?.level ?? "ще не визначено"}
          </span>
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <DashboardCard
            title="Почати тренування"
            text="Обери пісню та тренуй речення, слухання і введення слів."
            to="/songs"
            button="До пісень"
          />

          <DashboardCard
            title="Оцінювання"
            text="Пройди короткий тест, щоб система підібрала відповідний рівень."
            to="/assessment"
            button="Пройти тест"
          />

          <DashboardCard
            title="Прогрес"
            text="Переглянь результати занять і точність виконання."
            to="/progress"
            button="Мій прогрес"
          />
        </div>
      </section>
    </main>
  );
}

function DashboardCard({
  title,
  text,
  to,
  button,
}: {
  title: string;
  text: string;
  to: string;
  button: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black">{title}</h2>

      <p className="mt-4 min-h-20 leading-7 text-slate-600">{text}</p>

      <Link
        to={to}
        className="mt-6 inline-flex rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-600"
      >
        {button}
      </Link>
    </div>
  );
}