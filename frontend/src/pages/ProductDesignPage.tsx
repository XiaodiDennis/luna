import { Link } from "react-router-dom";

const pillars = [
  {
    title: "Повне речення, а не ізольоване слово",
    text: "Мінімальна стійка одиниця мовного навчання в Luna — це повне речення. Саме речення показує порядок слів, граматичну форму, значення і комунікативну ситуацію.",
  },
  {
    title: "Музика як середовище повторення",
    text: "Пісня створює ритм, емоційний контекст і природне повторення. Це допомагає учневі повертатися до матеріалу без відчуття механічного зубріння.",
  },
  {
    title: "Гра як форма активної практики",
    text: "Учень не просто слухає пісню. Він вводить англійські слова, перевіряє себе, бачить результат і поступово формує зв’язок між звуком, написанням і змістом.",
  },
  {
    title: "Оригінальний AI-контент",
    text: "AI дозволяє створювати пісні під рівень, стиль і навчальну мету. Але генерація має працювати не хаотично, а через редакційні, педагогічні й безпекові обмеження.",
  },
  {
    title: "Український контекст",
    text: "Луна розроблена для українських учнів. Тому приклади, теми й пояснення мають бути зрозумілими українському користувачу, а інтерфейс працює українською мовою.",
  },
  {
    title: "Контентна безпека",
    text: "Теми не повинні довільно вводитися користувачем. Бекенд обмежує тематичне поле, словник і культурні посилання, щоб контент був безпечним і педагогічно придатним.",
  },
];

export function ProductDesignPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="h-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
          <Link to="/" className="text-2xl font-bold">
            Луна
          </Link>

          <nav className="flex items-center gap-8 text-sm font-medium">
            <Link to="/generate" className="hover:text-sky-600">
              AI-генерація
            </Link>
            <Link to="/songs" className="hover:text-sky-600">
              Демо-пісні
            </Link>
            <Link
              to="/songs"
              className="rounded-xl bg-sky-500 px-5 py-3 text-white shadow-sm hover:bg-sky-600"
            >
              Спробувати
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-8 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
          Початкова мета та дизайн продукту
        </p>

        <h1 className="mt-4 text-5xl font-black leading-tight tracking-tight">
          Луна — це редакційно керований, педагогічно придатний і безпечний
          контентний продукт для вивчення англійської
        </h1>

        <p className="mt-6 text-xl leading-9 text-slate-600">
          Ми не позиціонуємо Luna лише як генератор музики або просту гру.
          Луна — це контент-провайдер, орієнтований на редакційний контроль,
          педагогічну відповідність і перевірку безпеки контенту. Її мета —
          зробити англомовну освіту більш розслабленою, творчою і практичною.
        </p>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-black">Продуктова теза</h2>

          <p className="mt-5 text-lg leading-8 text-slate-700">
            Луна побудована навколо одного дизайнерського припущення:
            <strong>
              {" "}
              найменша стійка одиниця мовного навчання — це повне речення,
              подане через музику, відпрацьоване як гра і створене як
              оригінальний контент.
            </strong>
          </p>

          <p className="mt-5 text-lg leading-8 text-slate-700">
            Кожен елемент Луна — модель взаємодії на основі речень,
            AI-згенеровані пісні в українському контексті, ігрова механіка,
            AI-помічник, шар безпеки контенту — є прямим продовженням цієї тези.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-black">Чому це важливо саме зараз</h2>

          <p className="mt-5 text-lg leading-8 text-slate-700">
            Луна створюється для українських учнів, насамперед дітей і
            підлітків, у момент, коли англійська мова стала обов’язковою
            частиною освітнього порядку денного України. Освітня система
            поступово відходить від надмірної жорсткості та рухається до
            більш дослідницької, європейської моделі навчання.
          </p>

          <p className="mt-5 text-lg leading-8 text-slate-700">
            AI вже може створювати грамотні тексти, природне звучання в різних
            жанрах і контент, адаптований до педагогічної мети. Те, що раніше
            вимагало складних ліцензійних домовленостей, тепер можна створювати
            внутрішньо, на вимогу і з повним редакційним контролем.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-bold">{pillar.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{pillar.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-slate-950 p-8 text-white">
          <h2 className="text-3xl font-black">Практичний висновок</h2>

          <p className="mt-5 text-lg leading-8 text-slate-300">
            Луна має розвиватися не як відкрита система випадкової генерації,
            а як контрольована освітня платформа. Користувач може обирати
            рівень і музичний стиль, але теми, словник, безпека й педагогічна
            логіка мають залишатися під контролем продукту.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/generate"
              className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600"
            >
              Перейти до AI-генерації
            </Link>

            <Link
              to="/songs"
              className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-slate-200 hover:bg-white/10"
            >
              Спробувати демо
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
