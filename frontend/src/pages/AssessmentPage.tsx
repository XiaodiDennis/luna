import { Link } from "react-router-dom";
import { LogoLink } from "../components/LogoLink";

export function AssessmentPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="h-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
          <LogoLink />

          <Link
            to="/student-dashboard"
            className="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-600"
          >
            Пропустити демо
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-8 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
          Оцінювання рівня
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Визначення рівня англійської
        </h1>

        <p className="mt-5 text-lg leading-8 text-slate-600">
          Ця сторінка буде використовуватися для короткого тесту після
          реєстрації учня. За результатом система визначатиме приблизний рівень:
          A1, A2, B1, B2, C1 або C2.
        </p>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black">MVP-версія тесту</h2>

          <p className="mt-4 leading-7 text-slate-600">
            На наступному етапі тут будуть питання з граматики, лексики та
            розуміння речень. Після завершення тесту результат буде збережено в
            базі даних.
          </p>

          <Link
            to="/student-dashboard"
            className="mt-8 inline-flex rounded-xl bg-sky-500 px-6 py-4 font-semibold text-white hover:bg-sky-600"
          >
            Перейти до кабінету учня
          </Link>
        </div>
      </section>
    </main>
  );
}