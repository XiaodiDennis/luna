import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { LogoLink } from "../components/LogoLink";

function getPlanLabel(plan: string) {
  if (plan === "individual") return "Індивідуальний план";
  if (plan === "enterprise") return "Корпоративний план";
  return "Безкоштовний демо-доступ";
}

export function AccountPage() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Завантаження акаунта...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-8 text-center">
          <h1 className="text-4xl font-black">Потрібен вхід</h1>
          <p className="mt-4 text-lg text-slate-600">
            Увійди або створи акаунт, щоб переглядати особистий кабінет.
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="h-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
          
          <LogoLink />

          <nav className="flex items-center gap-8 text-sm font-medium">
            <Link to="/progress" className="hover:text-sky-600">
              Прогрес
            </Link>
            <Link to="/pricing" className="hover:text-sky-600">
              Оплата
            </Link>
            <button onClick={logout} className="font-semibold text-slate-500 hover:text-rose-600">
              Вийти
            </button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
          Кабінет користувача
        </p>

        <h1 className="mt-3 text-5xl font-black">Вітаємо, {user.name}</h1>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold">Профіль</h2>

            <div className="mt-6 space-y-4">
              <InfoRow label="Ім’я" value={user.name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Тип користувача" value={user.role} />
              <InfoRow label="Поточний план" value={getPlanLabel(user.plan)} />
            </div>
          </section>

          <section className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
            <h2 className="text-2xl font-bold">Наступні можливості акаунта</h2>

            <p className="mt-4 leading-8 text-slate-300">
              У наступній версії акаунт буде пов’язаний із персональним
              прогресом, підпискою, історією згенерованих пісень і доступом до
              додаткових режимів практики.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/pricing"
                className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600"
              >
                Переглянути тарифи
              </Link>

              <Link
                to="/progress"
                className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-slate-200 hover:bg-white/10"
              >
                Мій прогрес
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
