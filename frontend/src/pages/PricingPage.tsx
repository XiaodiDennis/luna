import { Link } from "react-router-dom";

export function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="h-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
          <Link to="/" className="text-2xl font-bold">
            Луна
          </Link>

          <nav className="flex items-center gap-8 text-sm font-medium">
            <Link to="/login" className="hover:text-sky-600">
              Вхід
            </Link>
            <Link to="/songs" className="hover:text-sky-600">
              Демо-пісні
            </Link>
            <Link to="/design" className="hover:text-sky-600">
              Про продукт
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
            Тарифи
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Доступ до Луна
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Поточна сторінка оплати є продуктовим макетом. Вона фіксує модель
            монетизації для індивідуальних користувачів і корпоративних
            партнерів без підключення реального платіжного провайдера.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-sky-200 bg-white p-8 shadow-sm">
            <div className="w-fit rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
              Для індивідуальних користувачів
            </div>

            <h2 className="mt-6 text-3xl font-black">Індивідуальний доступ</h2>

            <p className="mt-5 leading-8 text-slate-600">
              Для учнів, батьків і дорослих користувачів, які хочуть регулярно
              тренувати слухання, написання слів і розуміння англійських речень
              через пісні.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="text-sm font-semibold text-slate-500">
                  Щомісячна оплата
                </div>

                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-black">299 ₴</span>
                  <span className="pb-1 text-slate-500">/ місяць</span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Гнучкий варіант для користувачів, які хочуть спробувати
                  продукт без річного зобов’язання.
                </p>
              </div>

              <div className="rounded-3xl border border-sky-300 bg-sky-50 p-6">
                <div className="text-sm font-semibold text-sky-700">
                  Річна оплата
                </div>

                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-black">2999 ₴</span>
                  <span className="pb-1 text-slate-500">/ 12 місяців</span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Вигідніший варіант для регулярного навчання протягом року.
                </p>
              </div>
            </div>

            <ul className="mt-8 space-y-3 text-slate-700">
              <li>• доступ до навчальних пісень</li>
              <li>• збереження прогресу</li>
              <li>• персональна історія тренувань</li>
              <li>• майбутній доступ до AI-планів генерації</li>
            </ul>

            <Link
              to="/login"
              className="mt-8 inline-flex rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600"
            >
              Створити акаунт
            </Link>
          </article>

          <article className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
            <div className="w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-sky-200">
              Для корпоративних користувачів
            </div>

            <h2 className="mt-6 text-3xl font-black">Корпоративний доступ</h2>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              Для шкіл, мовних центрів, освітніх платформ і партнерських
              організацій доступна окрема модель співпраці.
            </p>

            <div className="mt-6 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5 text-amber-100">
              Можлива модель розподілу доходу для корпоративних користувачів.
              Зв’яжіться з нами для деталей.
            </div>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li>• адаптація контенту під групи учнів</li>
              <li>• редакційний і педагогічний контроль</li>
              <li>• корпоративна аналітика прогресу</li>
              <li>• партнерська модель монетизації</li>
            </ul>

            <a
              href="mailto:contact@luna.example"
              className="mt-8 inline-flex rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-100"
            >
              Зв’язатися з нами
            </a>
          </article>
        </div>
      </section>
    </main>
  );
}
