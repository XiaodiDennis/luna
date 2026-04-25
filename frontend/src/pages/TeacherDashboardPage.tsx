import { Link } from "react-router-dom";
import { LogoLink } from "../components/LogoLink";
import { useAuth } from "../lib/auth";

const semesterOptions = [
  "Осінній семестр 2025",
  "Весняний семестр 2026",
  "Осінній семестр 2026",
];

const demoStudents = [
  {
    name: "Олена К.",
    level: "A2",
    semester: "Весняний семестр 2026",
    sessions: 18,
    accuracy: 76,
    completedSongs: 9,
    weakPoint: "Past Simple",
    risk: "Середній",
  },
  {
    name: "Максим Р.",
    level: "B1",
    semester: "Весняний семестр 2026",
    sessions: 22,
    accuracy: 84,
    completedSongs: 13,
    weakPoint: "Prepositions",
    risk: "Низький",
  },
  {
    name: "Анна С.",
    level: "A1",
    semester: "Весняний семестр 2026",
    sessions: 11,
    accuracy: 63,
    completedSongs: 5,
    weakPoint: "Basic verbs",
    risk: "Високий",
  },
  {
    name: "Данило М.",
    level: "B2",
    semester: "Весняний семестр 2026",
    sessions: 25,
    accuracy: 89,
    completedSongs: 15,
    weakPoint: "Phrasal verbs",
    risk: "Низький",
  },
  {
    name: "Ірина П.",
    level: "A2",
    semester: "Весняний семестр 2026",
    sessions: 16,
    accuracy: 71,
    completedSongs: 8,
    weakPoint: "Word order",
    risk: "Середній",
  },
];

export function TeacherDashboardPage() {
  const { user, logout } = useAuth();

  const totalSessions = demoStudents.reduce(
    (sum, student) => sum + student.sessions,
    0
  );

  const averageAccuracy = Math.round(
    demoStudents.reduce((sum, student) => sum + student.accuracy, 0) /
      demoStudents.length
  );

  const highRiskStudents = demoStudents.filter(
    (student) => student.risk === "Високий"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="h-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
          <LogoLink />

          <nav className="flex items-center gap-6 text-sm font-semibold">
            <a href="#upload" className="hover:text-sky-600">
              Завантаження
            </a>

            <Link to="/generate" className="hover:text-sky-600">
              AI-пісні
            </Link>

            <a href="#analytics" className="hover:text-sky-600">
              Аналітика класу
            </a>

            <button onClick={logout} className="hover:text-rose-600">
              Вийти
            </button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
          Кабінет викладача
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Вітаємо, {user?.name ?? "викладачу"}
        </h1>

        <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-600">
          Це окрема викладацька панель. Тут викладач може завантажувати навчальні
          матеріали, створювати персоналізовані навчальні пісні за допомогою AI
          та переглядати результати учнів за різні семестри.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          <StatCard title="Учнів у класі" value={`${demoStudents.length}`} />
          <StatCard title="Загальна кількість занять" value={`${totalSessions}`} />
          <StatCard title="Середня точність" value={`${averageAccuracy}%`} />
          <StatCard title="Потребують уваги" value={`${highRiskStudents}`} />
        </div>

        <section
          id="upload"
          className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                1. Завантаження контенту
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Завантажити навчальний матеріал
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                Викладач може завантажити текст уроку, список слів, граматичну
                тему або власні матеріали класу. У MVP це демонстраційний блок.
                Пізніше файл буде надсилатися на бекенд для аналізу,
                структурування та перетворення в навчальний сценарій.
              </p>
            </div>

            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="text-5xl">📄</div>

              <h3 className="mt-4 text-2xl font-black">
                Перетягніть файл сюди
              </h3>

              <p className="mt-3 text-slate-500">
                Підтримка в майбутньому: PDF, DOCX, TXT, CSV, списки слів.
              </p>

              <button
                type="button"
                className="mt-6 rounded-xl bg-sky-500 px-6 py-4 font-semibold text-white hover:bg-sky-600"
              >
                Обрати файл
              </button>

              <p className="mt-4 text-sm text-slate-400">
                Демо: файл поки не завантажується на сервер.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
              2. AI-персоналізація
            </p>

            <h2 className="mt-3 text-3xl font-black">
              AI-генерація навчальних пісень
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              AI-функція призначена саме для викладача. Учні не повинні
              самостійно керувати темами генерації. Викладач обирає рівень,
              стиль і педагогічну задачу, а система контролює безпеку,
              відповідність віку та навчальну складність.
            </p>

            <Link
              to="/generate"
              className="mt-6 inline-flex rounded-xl bg-sky-500 px-6 py-4 font-semibold text-white hover:bg-sky-600"
            >
              Відкрити AI-генерацію
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
              Захист даних
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Конфіденційність учнів
            </h2>

            <div className="mt-5 space-y-4 text-slate-600">
              <DataProtectionItem text="Дані учнів використовуються лише для навчальної аналітики." />
              <DataProtectionItem text="Викладач бачить результати лише своїх класів." />
              <DataProtectionItem text="AI-генерація не повинна містити приватні дані учнів." />
              <DataProtectionItem text="Експорт результатів має виконуватися лише з дозволу школи або відповідального викладача." />
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
              Перед використанням реальних даних учнів потрібно додати політику
              конфіденційності, згоду на обробку даних і правила доступу для
              викладачів та адміністраторів.
            </div>
          </div>
        </section>

        <section
          id="analytics"
          className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                3. Аналітика класу
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Результати учнів за семестрами
              </h2>

              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                Викладач може переглядати рівень, точність, кількість занять,
                слабкі місця та ризики для кожного учня. У цій MVP-версії
                показано демо-дані для 5 учнів.
              </p>
            </div>

            <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold">
              {semesterOptions.map((semester) => (
                <option key={semester}>{semester}</option>
              ))}
            </select>
          </div>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Учень</th>
                  <th className="px-4 py-3">Семестр</th>
                  <th className="px-4 py-3">Рівень</th>
                  <th className="px-4 py-3">Занять</th>
                  <th className="px-4 py-3">Пісень завершено</th>
                  <th className="px-4 py-3">Точність</th>
                  <th className="px-4 py-3">Слабке місце</th>
                  <th className="px-4 py-3">Ризик</th>
                </tr>
              </thead>

              <tbody>
                {demoStudents.map((student) => (
                  <tr key={student.name} className="border-t border-slate-200">
                    <td className="px-4 py-4 font-semibold">{student.name}</td>
                    <td className="px-4 py-4 text-slate-500">
                      {student.semester}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">
                        {student.level}
                      </span>
                    </td>
                    <td className="px-4 py-4">{student.sessions}</td>
                    <td className="px-4 py-4">{student.completedSongs}</td>
                    <td className="px-4 py-4">
                      <span
                        className={
                          student.accuracy >= 80
                            ? "font-bold text-emerald-600"
                            : student.accuracy >= 70
                            ? "font-bold text-amber-600"
                            : "font-bold text-rose-600"
                        }
                      >
                        {student.accuracy}%
                      </span>
                    </td>
                    <td className="px-4 py-4">{student.weakPoint}</td>
                    <td className="px-4 py-4">
                      <span
                        className={
                          student.risk === "Високий"
                            ? "rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700"
                            : student.risk === "Середній"
                            ? "rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700"
                            : "rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700"
                        }
                      >
                        {student.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-500">{title}</div>
      <div className="mt-3 text-3xl font-black">{value}</div>
    </div>
  );
}

function DataProtectionItem({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
      <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
      <p className="leading-7">{text}</p>
    </div>
  );
}