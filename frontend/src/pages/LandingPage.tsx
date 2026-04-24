import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

const musicStyles = [
  "Pop Ballad",
  "Indie Folk",
  "Acoustic Pop",
  "Lo-fi",
  "Piano Ballad",
  "Classroom Chant",
  "Soft Rock",
  "Cinematic",
];

const teamMembers = [
  {
    name: "Xiaodi Wang (Dennis)",
    role: "Лідер команди, Product Manager та Full-Stack Developer",
  },
  {
    name: "Emre Can",
    role: "AI & Automation Lead",
  },
  {
    name: "Artur",
    role: "Configuration Lead та Development Lead",
  },
  {
    name: "Oleg",
    role: "Front-End Lead",
  },
  {
    name: "Wadiya",
    role: "Storyteller, викладачка англійської, комунікація публікацій та підтримка Q&A",
  },
];

const productPrinciples = [
  {
    title: "Речення як основна одиниця навчання",
    text: "Луна тренує не окремі слова, а повні англійські речення, щоб учень одразу бачив граматику, порядок слів і значення у реальному контексті.",
  },
  {
    title: "Музика як м’який вхід у практику",
    text: "Пісня знижує напругу, створює ритм повторення і робить вправу менш схожою на звичайний тест.",
  },
  {
    title: "AI-контент під педагогічним контролем",
    text: "ШІ допомагає створювати оригінальні пісні та вправи, але теми, рівень, словник і безпека контенту мають проходити редакційний та педагогічний контроль.",
  },
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 h-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
          <Link to="/" className="text-2xl font-bold">
            Луна
          </Link>

          <nav className="flex items-center gap-8 text-sm font-medium">
            <Link to="/design" className="hover:text-sky-600">
              Про продукт
            </Link>
            <a href="#ai-generation" className="hover:text-sky-600">
              AI-генерація
            </a>
            <Link to="/pricing" className="hover:text-sky-600">
              Оплата
            </Link>
            <Link to="/progress" className="hover:text-sky-600">
              Прогрес
            </Link>
            <a href="#team" className="hover:text-sky-600">
              Команда
            </a>
            <Link
              to="/songs"
              className="rounded-xl bg-sky-500 px-5 py-3 text-white shadow-sm hover:bg-sky-600"
            >
              Спробувати
            </Link>

            <AvatarMenu />
          </nav>
        </div>
      </header>

      <section className="mx-auto flex max-w-5xl flex-col items-center px-8 py-24 text-center">
        <div className="mb-6 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
          Музичне вивчення англійської для українських школярів
        </div>

        <h1 className="max-w-4xl text-6xl font-black leading-tight tracking-tight">
          Вивчай англійську через пісні про Україну
        </h1>

        <p className="mt-6 max-w-3xl text-xl leading-8 text-slate-600">
          Луна перетворює оригінальні англомовні пісні на гру: слухай рядок,
          вводь слова англійською і одразу бач пояснення українською.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/songs"
            className="rounded-xl bg-sky-500 px-8 py-4 text-lg font-semibold text-white shadow-md hover:bg-sky-600"
          >
            Почати демо
          </Link>

          <a
            href="#ai-generation"
            className="rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-800 shadow-sm hover:bg-slate-100"
          >
            Подивитися AI-генерацію
          </a>
        </div>
      </section>

      <section id="ai-generation" className="border-y border-slate-200 bg-white px-8 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
              AI-генерація як дослідницький фокус
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Оригінальні навчальні пісні замість випадкового контенту
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              AI-функції є частиною головної цінності продукту. Луна показує,
              як можна створювати англомовні пісні під конкретний рівень учня,
              стиль музики та педагогічні правила без залежності від
              ліцензійного музичного каталогу.
            </p>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              Користувач може вибрати рівень англійської та музичний стиль.
              Тему пісні, словникову безпеку, відповідність віку й навчальну
              придатність контролює бекенд.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/generate"
                className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600"
              >
                Відкрити сторінку генерації
              </Link>

              <Link
                to="/design"
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-800 hover:bg-slate-50"
              >
                Прочитати дизайн-логіку
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="rounded-2xl bg-slate-950 p-6 text-white">
              <div className="text-sm font-semibold text-sky-300">
                Майбутній сценарій генерації
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard label="Рівень" value="A1-C2" />
                <InfoCard label="Тема" value="обирається бекендом" />
                <InfoCard label="Мова інтерфейсу" value="Українська" />
                <InfoCard label="Мова навчання" value="Англійська" />
              </div>

              <div className="mt-6 rounded-2xl bg-white/10 p-5">
                <div className="text-sm font-semibold text-sky-200">
                  Музичні стилі
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {musicStyles.map((style) => (
                    <span
                      key={style}
                      className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5 text-amber-100">
                Луна є не просто генератором пісень, а редакційно керованим,
                педагогічно узгодженим і безпечним постачальником навчального
                контенту.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b border-slate-200 bg-slate-50 px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
              Оплата
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Індивідуальний доступ і корпоративна співпраця
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Індивідуальні користувачі: 299 ₴ на місяць. Для шкіл, мовних
              центрів та освітніх партнерів доступна корпоративна модель з
              розподілом доходу. Зв’яжіться з нами для деталей.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                to="/pricing"
                className="rounded-xl bg-sky-500 px-8 py-4 text-lg font-semibold text-white shadow-md hover:bg-sky-600"
              >
                Переглянути тарифи
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
              Дизайн продукту
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Луна робить англійську спокійнішою, творчою і практичною
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Ми працюємо як контент-провайдер, орієнтований на редакційний
              контроль, педагогічну відповідність і перевірку безпеки контенту.
              Мета — зробити англомовну освіту менш напруженою, більш творчою
              і ближчою до реального мовного використання.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {productPrinciples.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="border-t border-slate-200 bg-white px-8 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
              Команда
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight">
              Люди, які створюють Луна
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Команда Луна поєднує продуктове мислення, full-stack розробку,
              AI-автоматизацію, фронтенд-дизайн, педагогічну логіку та
              комунікацію з користувачами.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-xl font-bold text-sky-700">
                  {member.name.charAt(0)}
                </div>

                <h3 className="mt-5 text-xl font-bold">{member.name}</h3>

                <p className="mt-2 leading-7 text-slate-600">{member.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function AvatarMenu() {
  const { user, logout } = useAuth();

  const initial = user?.name?.charAt(0).toUpperCase() ?? "Г";

  return (
    <div className="group relative">
      <button
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-black text-slate-700 shadow-sm hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
        aria-label="Меню користувача"
      >
        {initial}
      </button>

      <div className="invisible absolute right-0 top-12 z-30 w-72 translate-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-left opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        {user ? (
          <>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Ви увійшли як</div>
              <div className="mt-1 font-bold text-slate-950">{user.name}</div>
              <div className="mt-1 text-sm text-slate-500">{user.email}</div>
            </div>

            <div className="mt-3 grid gap-2">
              <Link
                to="/account"
                className="rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Особистий кабінет
              </Link>
              <Link
                to="/progress"
                className="rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Мій прогрес
              </Link>
              <button
                onClick={logout}
                className="rounded-xl px-4 py-3 text-left font-semibold text-rose-600 hover:bg-rose-50"
              >
                Вийти
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="font-bold text-slate-950">Обліковий запис</div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Увійдіть або зареєструйтеся, щоб зберігати прогрес і керувати
              майбутньою підпискою.
            </p>

            <div className="mt-4 grid gap-2">
              <Link
                to="/login"
                className="rounded-xl bg-sky-500 px-4 py-3 text-center font-semibold text-white hover:bg-sky-600"
              >
                Увійти
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
              >
                Зареєструватися
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="text-sm text-slate-300">{label}</div>
      <div className="mt-1 font-bold text-white">{value}</div>
    </div>
  );
}
