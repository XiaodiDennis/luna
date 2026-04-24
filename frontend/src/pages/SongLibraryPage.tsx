import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSongs } from "../lib/api";
import type { DemoSong } from "../data/demoSongs";

export function SongLibraryPage() {
  const [songs, setSongs] = useState<DemoSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    let isMounted = true;

    getSongs()
      .then((data) => {
        if (!isMounted) return;
        setSongs(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error(error);
        if (!isMounted) return;
        setErrorText("Не вдалося завантажити пісні.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="h-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
          <Link to="/" className="text-2xl font-bold">
            Луна
          </Link>

          <div className="flex items-center gap-6 text-sm font-medium">
            <Link to="/generate" className="hover:text-sky-600">
              AI-генерація
            </Link>
            <span className="text-slate-500">Гостьовий режим</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-12">
        <h1 className="text-4xl font-black">Обери пісню</h1>

        <p className="mt-3 text-lg text-slate-600">
          Вибери одну оригінальну пісню Luna і почни вправу на слухання та введення слів.
        </p>

        {isLoading && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Завантаження пісень...
          </div>
        )}

        {!isLoading && errorText && (
          <div className="mt-10 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            {errorText}
          </div>
        )}

        {!isLoading && !errorText && songs.length === 0 && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Пісні поки що не знайдено.
          </div>
        )}

        {!isLoading && songs.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {songs.map((song) => (
              <article
                key={song.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex h-44 items-center justify-center rounded-2xl bg-sky-100 text-5xl">
                  🎵
                </div>

                <h2 className="text-2xl font-bold">{song.title}</h2>

                <p className="mt-2 text-slate-500">
                  {song.genreUk} · {song.level} · {song.durationSec} с
                </p>

                <p className="mt-4 min-h-14 text-slate-600">
                  {song.descriptionUk}
                </p>

                <Link
                  to={`/play/${song.id}`}
                  className="mt-6 inline-flex rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-600"
                >
                  Грати
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}