import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { LogoLink } from "../components/LogoLink";

type AuthMode = "login" | "register" | "forgot" | "reset";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register, forgotPassword, resetPassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("123456");
  const [newPassword, setNewPassword] = useState("123456");
  const [resetCode, setResetCode] = useState("");
  const [devResetCode, setDevResetCode] = useState("");
  const [noticeText, setNoticeText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrorText("");
    setNoticeText("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorText("");
    setNoticeText("");
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await register({ name, email, password });
        navigate("/account");
        return;
      }

      if (mode === "login") {
        await login({ email, password });
        navigate("/account");
        return;
      }

      if (mode === "forgot") {
        const result = await forgotPassword({ email });
        setNoticeText(result.message);

        if (result.devResetCode) {
          setDevResetCode(result.devResetCode);
          setResetCode(result.devResetCode);
        }

        setMode("reset");
        return;
      }

      if (mode === "reset") {
        await resetPassword({ email, resetCode, newPassword });
        navigate("/account");
      }
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Не вдалося виконати дію."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="h-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
          
          <LogoLink />

          <nav className="flex items-center gap-8 text-sm font-medium">
            <Link to="/pricing" className="hover:text-sky-600">
              Оплата
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

      <section className="mx-auto flex max-w-6xl items-center justify-center px-8 py-16">
        <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
              Обліковий запис
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight">
              Увійди, щоб зберігати свій навчальний прогрес
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Акаунт потрібен для збереження результатів тренувань, історії
              прогресу, майбутньої підписки та доступу до персоналізованих
              навчальних матеріалів.
            </p>
            <div className="mt-8 rounded-2xl bg-white/10 p-5 text-sm leading-7 text-slate-200">
              Відновлення пароля в MVP працює як демонстрація: код показується
              на сторінці. У production-версії код має надсилатися email-листом.
            </div>
          </aside>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={
                  mode === "login"
                    ? "rounded-xl bg-white px-4 py-3 font-semibold shadow-sm"
                    : "rounded-xl px-4 py-3 font-semibold text-slate-500"
                }
              >
                Вхід
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={
                  mode === "register"
                    ? "rounded-xl bg-white px-4 py-3 font-semibold shadow-sm"
                    : "rounded-xl px-4 py-3 font-semibold text-slate-500"
                }
              >
                Реєстрація
              </button>
            </div>

            <h2 className="mt-8 text-3xl font-black">
              {mode === "login" && "Увійти до акаунта"}
              {mode === "register" && "Створити акаунт"}
              {mode === "forgot" && "Відновити пароль"}
              {mode === "reset" && "Створити новий пароль"}
            </h2>

            <p className="mt-2 text-slate-500">
              {mode === "login" && "Введи email і пароль, щоб продовжити."}
              {mode === "register" && "Створи акаунт для збереження прогресу."}
              {mode === "forgot" &&
                "Введи email, і система створить код відновлення."}
              {mode === "reset" && "Введи код відновлення та новий пароль."}
            </p>

            {mode === "register" && (
              <label className="mt-6 block">
                <span className="text-sm font-semibold text-slate-700">Ім’я</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
                  placeholder="Наприклад: Олена"
                />
              </label>
            )}

            <label className="mt-6 block">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
                placeholder="student@example.com"
                type="email"
              />
            </label>

            {(mode === "login" || mode === "register") && (
              <label className="mt-6 block">
                <span className="text-sm font-semibold text-slate-700">Пароль</span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
                  placeholder="Мінімум 6 символів"
                  type="password"
                />
              </label>
            )}

            {mode === "reset" && (
              <>
                <label className="mt-6 block">
                  <span className="text-sm font-semibold text-slate-700">
                    Код відновлення
                  </span>
                  <input
                    value={resetCode}
                    onChange={(event) => setResetCode(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
                    placeholder="6-значний код"
                  />
                </label>
                <label className="mt-6 block">
                  <span className="text-sm font-semibold text-slate-700">
                    Новий пароль
                  </span>
                  <input
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
                    placeholder="Мінімум 6 символів"
                    type="password"
                  />
                </label>
              </>
            )}

            {noticeText && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                {noticeText}
              </div>
            )}

            {devResetCode && mode === "reset" && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Код для MVP-тесту: <strong>{devResetCode}</strong>
              </div>
            )}

            {errorText && (
              <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                {errorText}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 w-full rounded-xl bg-sky-500 px-6 py-4 font-semibold text-white shadow-md hover:bg-sky-600 disabled:bg-slate-300"
            >
              {isSubmitting && "Обробка..."}
              {!isSubmitting && mode === "register" && "Створити акаунт"}
              {!isSubmitting && mode === "login" && "Увійти"}
              {!isSubmitting && mode === "forgot" && "Отримати код"}
              {!isSubmitting && mode === "reset" && "Оновити пароль"}
            </button>

            <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
              {mode !== "login" && (
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-semibold text-sky-600 hover:text-sky-700"
                >
                  Повернутися до входу
                </button>
              )}
              {mode !== "register" && (
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-semibold text-sky-600 hover:text-sky-700"
                >
                  Зареєструватися
                </button>
              )}
              {mode !== "forgot" && (
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="font-semibold text-slate-500 hover:text-slate-700"
                >
                  Забули пароль?
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
