import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { getSong, submitSession } from "../lib/api";

type LyricWord = {
  id?: string;
  order?: number;
  text: string;
  ipa?: string | null;
  pos?: string;
  ukrainian?: string;
};

type LyricLine = {
  id?: string;
  order?: number;
  startMs: number;
  endMs: number;
  english: string;
  ukrainian: string;
  words?: LyricWord[];
};

type Song = {
  id: string;
  title: string;
  audioUrl: string;
  level?: string;
  genreUk?: string;
  durationSec?: number;
  descriptionUk?: string;
  lines: LyricLine[];
};

function normalizeWord(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:"“”‘’()[\]{}]/g, "");
}

function splitWords(line: LyricLine): LyricWord[] {
  if (line.words && line.words.length > 0) {
    return [...line.words].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  return line.english.split(/\s+/).map((text, index) => ({
    id: `${line.id ?? "line"}_${index}`,
    order: index,
    text,
    pos: "",
    ukrainian: "",
  }));
}

export function GamePage() {
  const { songId } = useParams();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  const [song, setSong] = useState<Song | null>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const [typedWord, setTypedWord] = useState("");
  const [revealedWords, setRevealedWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [isLineComplete, setIsLineComplete] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSong() {
      if (!songId) return;

      const loadedSong = (await getSong(songId)) as unknown as Song;

      if (cancelled) return;

      setSong({
        ...loadedSong,
        lines: [...loadedSong.lines].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        ),
      });
    }

    loadSong();

    return () => {
      cancelled = true;
    };
  }, [songId]);

  const currentLine = song?.lines[lineIndex] ?? null;

  const currentWords = useMemo(() => {
    return currentLine ? splitWords(currentLine) : [];
  }, [currentLine]);

  const progressPercent = song
    ? Math.round(((lineIndex + (isFinished ? 1 : 0)) / song.lines.length) * 100)
    : 0;

  useEffect(() => {
    if (!currentLine || !audioRef.current) return;

    const audio = audioRef.current;

    function handleTimeUpdate() {
      if (!currentLine || !audioRef.current) return;

      if (audioRef.current.currentTime * 1000 >= currentLine.endMs) {
        audioRef.current.pause();
      }
    }

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [currentLine]);

  async function playCurrentLine() {
    if (!currentLine || !audioRef.current) return;

    const audio = audioRef.current;
    audio.currentTime = currentLine.startMs / 1000;
    await audio.play();
  }

  function checkWord() {
    if (!currentLine || currentWords.length === 0 || isLineComplete) return;

    const nextWord = currentWords[revealedWords.length];

    if (!nextWord) return;

    if (normalizeWord(typedWord) === normalizeWord(nextWord.text)) {
      setRevealedWords((previous) => [...previous, nextWord.text]);
      setCorrectWords((previous) => previous + 1);
      setScore((previous) => previous + 100);
      setTypedWord("");

      if (revealedWords.length + 1 === currentWords.length) {
        setIsLineComplete(true);
        audioRef.current?.pause();
      }

      return;
    }

    setMistakes((previous) => previous + 1);
    setScore((previous) => Math.max(0, previous - 25));
    setTypedWord("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      checkWord();
    }
  }

  function skipLine() {
    if (!currentLine) return;

    const allWords = currentWords.map((word) => word.text);
    const missingWords = Math.max(0, allWords.length - revealedWords.length);

    setRevealedWords(allWords);
    setMistakes((previous) => previous + missingWords);
    setIsLineComplete(true);
    audioRef.current?.pause();
  }

  async function saveResultIfNeeded(finalSong: Song) {
    if (isSaving) return;

    setIsSaving(true);

    const totalWords = finalSong.lines.reduce(
      (sum, line) => sum + splitWords(line).length,
      0
    );

    const accuracy =
      totalWords === 0 ? 0 : Math.round((correctWords / totalWords) * 100);

    const durationSec = Math.round((Date.now() - startedAtRef.current) / 1000);

    await submitSession({
      songId: finalSong.id,
      mode: "dictation",
      score,
      accuracy,
      totalWords,
      correctWords,
      mistakes,
      durationSec,
    });

    setIsSaving(false);
  }

  async function goToNextLine() {
    if (!song) return;

    if (lineIndex + 1 >= song.lines.length) {
      setIsFinished(true);
      await saveResultIfNeeded(song);
      return;
    }

    setLineIndex((previous) => previous + 1);
    setTypedWord("");
    setRevealedWords([]);
    setIsLineComplete(false);
  }

  if (!song) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-slate-300">
        Завантаження пісні...
      </main>
    );
  }

  if (song.lines.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-slate-300">
        <h1 className="text-3xl font-bold text-white">У пісні немає рядків</h1>
        <Link to="/songs" className="text-sky-400 hover:text-sky-300">
          Повернутися до списку пісень
        </Link>
      </main>
    );
  }

  if (isFinished) {
    const totalWords = song.lines.reduce(
      (sum, line) => sum + splitWords(line).length,
      0
    );
    const accuracy =
      totalWords === 0 ? 0 : Math.round((correctWords / totalWords) * 100);

    return (
      <main className="min-h-screen bg-black text-white">
        <section className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-8 text-center">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
              Тренування завершено
            </p>

            <h1 className="mt-4 text-5xl font-black">{song.title}</h1>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <ResultCard label="Бал" value={String(score)} />
              <ResultCard label="Точність" value={`${accuracy}%`} />
              <ResultCard label="Помилки" value={String(mistakes)} />
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/songs"
                className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600"
              >
                До списку пісень
              </Link>

              <Link
                to="/progress"
                className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-slate-200 hover:bg-white/10"
              >
                Переглянути прогрес
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const safeCurrentLine = currentLine ?? song.lines[0];

  return (
    <main className="min-h-screen bg-black text-white">
      <audio ref={audioRef} src={song.audioUrl} preload="metadata" />

      <header className="border-b border-white/10 bg-black">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
          <div className="flex items-center gap-5">
            <Link to="/songs" className="text-slate-400 hover:text-white">
              ← Назад
            </Link>

            <div className="font-bold">{song.title}</div>

            <div className="text-slate-400">
              {lineIndex + 1}/{song.lines.length}
            </div>
          </div>

          <div className="font-bold text-sky-400">Бал {score}</div>
        </div>

        <div className="h-1 bg-white/10">
          <div
            className="h-full bg-sky-400 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-84px)] max-w-6xl flex-col items-center justify-center px-8 py-12 text-center">
        <p className="text-2xl font-semibold text-slate-300">
          {safeCurrentLine.ukrainian}
        </p>

        <div className="mt-16 flex flex-wrap items-end justify-center gap-4">
          {currentWords.map((word, index) => {
            const isRevealed = index < revealedWords.length;

            return (
              <div key={`${word.text}_${index}`} className="min-w-24">
                <div className="mb-2 min-h-7 rounded-md bg-white/10 px-3 py-1 text-sm text-slate-300">
                  {isLineComplete && word.ipa ? word.ipa : ""}
                </div>

                <div className="border-b-4 border-sky-400 px-2 pb-2 text-4xl font-black">
                  {isRevealed || isLineComplete ? word.text : ""}
                </div>

                {isLineComplete && (
                  <div className="mt-2 text-sm text-slate-400">
                    <div>{word.pos}</div>
                    <div>{word.ukrainian}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!isLineComplete && (
          <input
            value={typedWord}
            onChange={(event) => setTypedWord(event.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="mt-12 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center text-2xl font-bold text-white outline-none focus:border-sky-400"
            placeholder="Введи слово англійською"
          />
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            onClick={playCurrentLine}
            className="rounded-xl bg-sky-500 px-8 py-4 font-semibold text-white hover:bg-sky-600"
          >
            Прослухати рядок
          </button>

          {!isLineComplete && (
            <button
              onClick={skipLine}
              className="rounded-xl border border-white/10 px-8 py-4 font-semibold text-slate-300 hover:bg-white/10"
            >
              Пропустити рядок
            </button>
          )}

          {isLineComplete && (
            <button
              onClick={goToNextLine}
              className="rounded-xl bg-sky-500 px-8 py-4 font-semibold text-white hover:bg-sky-600"
            >
              {lineIndex + 1 >= song.lines.length
                ? "Завершити"
                : "Наступний рядок"}
            </button>
          )}
        </div>

        <p className="mt-8 text-slate-500">
          Введи слово англійською. Натисни Space або Enter для підтвердження.
        </p>
      </section>
    </main>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-6">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}
