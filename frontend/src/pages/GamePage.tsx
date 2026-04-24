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

type PlaybackStatus = "idle" | "playing" | "paused" | "finished";

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

function getWordWidth(word: string) {
  return Math.max(72, Math.min(180, word.length * 24));
}

function clampTimeMs(value: number) {
  return Math.max(0, value);
}

export function GamePage() {
  const { songId } = useParams();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultSavedRef = useRef(false);

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
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>("idle");
  const [syncOffsetMs, setSyncOffsetMs] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSong() {
      if (!songId) return;

      const loadedSong = (await getSong(songId)) as unknown as Song;

      if (cancelled) return;

      const sortedLines = [...(loadedSong.lines ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );

      setSong({
        ...loadedSong,
        lines: sortedLines,
      });

      const savedOffset = localStorage.getItem(`luna_sync_offset_${loadedSong.id}`);

      if (savedOffset) {
        setSyncOffsetMs(Number(savedOffset));
      }
    }

    loadSong();

    return () => {
      cancelled = true;
    };
  }, [songId]);

  const safeLineIndex =
    song && song.lines.length > 0
      ? Math.min(Math.max(lineIndex, 0), song.lines.length - 1)
      : 0;

  const currentLine = song?.lines[safeLineIndex] ?? null;

  const currentWords = useMemo(() => {
    return currentLine ? splitWords(currentLine) : [];
  }, [currentLine]);

  const totalWords = useMemo(() => {
    if (!song) return 0;

    return song.lines.reduce((sum, line) => sum + splitWords(line).length, 0);
  }, [song]);

  const accuracy =
    totalWords === 0 ? 0 : Math.round((correctWords / totalWords) * 100);

  const progressPercent =
    song && song.lines.length > 0
      ? Math.round(((safeLineIndex + (isFinished ? 1 : 0)) / song.lines.length) * 100)
      : 0;

  const activeWordIndex = Math.min(revealedWords.length, currentWords.length - 1);

  function getAdjustedStartMs(line: LyricLine) {
    return clampTimeMs(line.startMs + syncOffsetMs);
  }

  function getAdjustedEndMs(line: LyricLine) {
    return Math.max(getAdjustedStartMs(line) + 300, line.endMs + syncOffsetMs);
  }

  useEffect(() => {
    if (!currentLine || !audioRef.current) return;

    const audio = audioRef.current;

    function handleTimeUpdate() {
      if (!currentLine || !audioRef.current) return;

      const endSecond = getAdjustedEndMs(currentLine) / 1000;

      if (audioRef.current.currentTime >= endSecond) {
        audioRef.current.pause();
        setPlaybackStatus("paused");
        setFeedbackText("Рядок зупинено автоматично. Тепер введи слова англійською.");
        inputRef.current?.focus();
      }
    }

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [currentLine, syncOffsetMs]);

  useEffect(() => {
    setTypedWord("");
    setRevealedWords([]);
    setIsLineComplete(false);
    setPlaybackStatus("idle");
    setFeedbackText("");
    audioRef.current?.pause();

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [safeLineIndex]);

  useEffect(() => {
    if (!song) return;

    localStorage.setItem(`luna_sync_offset_${song.id}`, String(syncOffsetMs));
  }, [song, syncOffsetMs]);

  async function playCurrentLine() {
    if (!currentLine || !audioRef.current) return;

    const audio = audioRef.current;
    audio.currentTime = getAdjustedStartMs(currentLine) / 1000;

    setPlaybackStatus("playing");
    setFeedbackText("Прослухай рядок. Відтворення зупиниться автоматично.");

    try {
      await audio.play();
    } catch {
      setPlaybackStatus("paused");
      setFeedbackText("Браузер заблокував автозапуск. Натисни кнопку ще раз.");
    }
  }

  function pauseAudio() {
    audioRef.current?.pause();
    setPlaybackStatus("paused");
    setFeedbackText("Пауза. Можеш продовжити введення або прослухати рядок ще раз.");
    inputRef.current?.focus();
  }

  function replayLine() {
    setTypedWord("");
    setRevealedWords([]);
    setIsLineComplete(false);
    setFeedbackText("");
    void playCurrentLine();
  }

  function checkWord() {
    if (!currentLine || currentWords.length === 0 || isLineComplete) return;

    const nextWord = currentWords[revealedWords.length];

    if (!nextWord) return;

    if (normalizeWord(typedWord) === normalizeWord(nextWord.text)) {
      const nextRevealedWords = [...revealedWords, nextWord.text];

      setRevealedWords(nextRevealedWords);
      setCorrectWords((previous) => previous + 1);
      setScore((previous) => previous + 100);
      setTypedWord("");
      setFeedbackText("Правильно.");

      if (nextRevealedWords.length === currentWords.length) {
        setIsLineComplete(true);
        setPlaybackStatus("finished");
        audioRef.current?.pause();
        setFeedbackText("Рядок завершено. Перейди до наступного рядка.");
      }

      return;
    }

    setMistakes((previous) => previous + 1);
    setScore((previous) => Math.max(0, previous - 25));
    setTypedWord("");
    setFeedbackText("Неправильно. Спробуй ще раз або прослухай рядок.");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      checkWord();
    }

    if (event.key === "ArrowRight" && isLineComplete) {
      event.preventDefault();
      void goToNextLine();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPreviousLine();
    }
  }

  function revealCurrentLine() {
    if (!currentLine) return;

    const allWords = currentWords.map((word) => word.text);
    const missingWords = Math.max(0, allWords.length - revealedWords.length);

    setRevealedWords(allWords);
    setMistakes((previous) => previous + missingWords);
    setIsLineComplete(true);
    setPlaybackStatus("finished");
    audioRef.current?.pause();
    setFeedbackText("Відповідь показано. Перейди до наступного рядка.");
  }

  function goToPreviousLine() {
    if (!song || safeLineIndex <= 0) return;

    setLineIndex((previous) => Math.max(0, previous - 1));
  }

  async function saveResultIfNeeded(finalSong: Song) {
    if (isSaving || resultSavedRef.current) return;

    resultSavedRef.current = true;
    setIsSaving(true);

    const durationSec = Math.round((Date.now() - startedAtRef.current) / 1000);

    try {
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
    } catch (error) {
      console.error("Failed to save result:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function goToNextLine() {
    if (!song) return;

    if (safeLineIndex + 1 >= song.lines.length) {
      setIsFinished(true);
      await saveResultIfNeeded(song);
      return;
    }

    setLineIndex((previous) => Math.min(song.lines.length - 1, previous + 1));
  }

  function adjustTimeline(deltaMs: number) {
    setSyncOffsetMs((previous) => previous + deltaMs);
    setFeedbackText(
      deltaMs < 0
        ? "Таймінг зміщено на 1 секунду раніше."
        : "Таймінг зміщено на 1 секунду пізніше."
    );
  }

  function resetTimeline() {
    setSyncOffsetMs(0);
    setFeedbackText("Зсув таймінгу скинуто.");
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

            {isSaving && (
              <p className="mt-5 text-sm text-slate-400">Збереження результату...</p>
            )}
          </div>
        </section>
      </main>
    );
  }

  const activeLine = currentLine ?? song.lines[0];

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
              {safeLineIndex + 1}/{song.lines.length}
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

      <section className="mx-auto flex min-h-[calc(100vh-84px)] max-w-6xl flex-col items-center justify-center px-8 py-10 text-center">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400">
          <span>
            Рядок {safeLineIndex + 1} з {song.lines.length}
          </span>
          <span>•</span>
          <span>
            Таймінг: {syncOffsetMs >= 0 ? "+" : ""}
            {(syncOffsetMs / 1000).toFixed(1)}с
          </span>
          <span>•</span>
          <span>
            Статус:{" "}
            {playbackStatus === "idle" && "очікує"}
            {playbackStatus === "playing" && "відтворюється"}
            {playbackStatus === "paused" && "автопауза"}
            {playbackStatus === "finished" && "завершено"}
          </span>
        </div>

        <p className="text-2xl font-semibold text-slate-300">
          {activeLine.ukrainian}
        </p>

        <div className="mt-14 flex flex-wrap items-end justify-center gap-x-4 gap-y-8">
          {currentWords.map((word, index) => {
            const isRevealed = index < revealedWords.length;
            const isActive = index === activeWordIndex && !isLineComplete;
            const width = getWordWidth(word.text);

            return (
              <div key={`${word.text}_${index}`} className="text-center">
                <div className="mb-2 h-7 rounded-md bg-white/10 px-3 py-1 text-sm text-slate-300">
                  {isLineComplete && word.ipa ? word.ipa : ""}
                </div>

                {isActive ? (
                  <input
                    ref={inputRef}
                    value={typedWord}
                    onChange={(event) => setTypedWord(event.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    style={{ width }}
                    className="border-b-4 border-sky-400 bg-transparent px-2 pb-2 text-center text-4xl font-black text-white outline-none placeholder:text-slate-700"
                    placeholder=" "
                    aria-label="Введи слово англійською"
                  />
                ) : (
                  <div
                    style={{ width }}
                    className={
                      isRevealed || isLineComplete
                        ? "border-b-4 border-sky-400 px-2 pb-2 text-center text-4xl font-black text-white"
                        : "border-b-4 border-slate-600 px-2 pb-2 text-center text-4xl font-black text-transparent"
                    }
                  >
                    {isRevealed || isLineComplete ? word.text : "_"}
                  </div>
                )}

                {isLineComplete && (
                  <div className="mt-2 min-h-10 text-sm text-slate-400">
                    <div>{word.pos}</div>
                    <div>{word.ukrainian}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 min-h-6 text-sm font-semibold text-sky-300">
          {feedbackText || "Натисни «Прослухати рядок», потім введи слова прямо в лінію."}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={playCurrentLine}
            className="rounded-xl bg-sky-500 px-7 py-4 font-semibold text-white hover:bg-sky-600"
          >
            Прослухати рядок
          </button>

          <button
            onClick={pauseAudio}
            className="rounded-xl border border-white/10 px-7 py-4 font-semibold text-slate-300 hover:bg-white/10"
          >
            Пауза
          </button>

          <button
            onClick={replayLine}
            className="rounded-xl border border-white/10 px-7 py-4 font-semibold text-slate-300 hover:bg-white/10"
          >
            Повторити рядок
          </button>

          {!isLineComplete && (
            <button
              onClick={revealCurrentLine}
              className="rounded-xl border border-white/10 px-7 py-4 font-semibold text-slate-300 hover:bg-white/10"
            >
              Показати відповідь
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => adjustTimeline(-1000)}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10"
          >
            −1с раніше
          </button>

          <button
            onClick={resetTimeline}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10"
          >
            Скинути таймінг
          </button>

          <button
            onClick={() => adjustTimeline(1000)}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10"
          >
            +1с пізніше
          </button>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={goToPreviousLine}
            disabled={safeLineIndex === 0}
            className="rounded-xl border border-white/10 px-7 py-4 font-semibold text-slate-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Попередній рядок
          </button>

          <button
            onClick={() => void goToNextLine()}
            className="rounded-xl bg-slate-100 px-7 py-4 font-semibold text-slate-950 hover:bg-white"
          >
            {safeLineIndex + 1 >= song.lines.length
              ? "Завершити"
              : "Наступний рядок →"}
          </button>
        </div>

        <p className="mt-8 text-slate-500">
          Введи слово англійською прямо на активній лінії. Натисни Space або
          Enter для підтвердження. Стрілка ← повертає до попереднього рядка.
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
