import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { DemoSong } from "../data/demoSongs";
import { getSong, submitSession } from "../lib/api";
import { isCorrectWord } from "../lib/gameLogic";

export function GamePage() {
  const { songId } = useParams();

  const gameRef = useRef<HTMLElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lineStopTimerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  const [song, setSong] = useState<DemoSong | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [lineIndex, setLineIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [manualOffsetMs, setManualOffsetMs] = useState(0);
  const [sessionSaved, setSessionSaved] = useState(false);

  useEffect(() => {
    if (!songId) {
      setLoadError("Song id is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    getSong(songId)
      .then((data) => {
        setSong(data);
        setManualOffsetMs(data.syncOffsetMs ?? 0);
        startedAtRef.current = Date.now();
      })
      .catch((error) => {
        console.error(error);
        setLoadError("Не вдалося завантажити пісню.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [songId]);

  useEffect(() => {
    gameRef.current?.focus();
  }, [lineIndex, showReview, isComplete, song]);

  useEffect(() => {
    return () => {
      clearLineStopTimer();
    };
  }, []);

  function clearLineStopTimer() {
    if (lineStopTimerRef.current !== null) {
      window.clearTimeout(lineStopTimerRef.current);
      lineStopTimerRef.current = null;
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07070a] text-white">
        <div className="text-slate-400">Завантаження пісні...</div>
      </main>
    );
  }

  if (loadError || !song) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07070a] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Пісню не знайдено</h1>
          <p className="mt-3 text-slate-400">{loadError}</p>
          <Link
            to="/songs"
            className="mt-6 inline-flex rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white"
          >
            Повернутися до списку
          </Link>
        </div>
      </main>
    );
  }

  const currentLine = song.lines[lineIndex];
  const currentWord = currentLine.words[wordIndex];

  const totalWords = song.lines.reduce((sum, line) => sum + line.words.length, 0);
  const correctWords = Math.floor(score / 100);
  const accuracy =
    correctWords + mistakes === 0
      ? 100
      : Math.round((correctWords / (correctWords + mistakes)) * 100);

  function stopLinePlayback() {
    const audio = audioRef.current;
    clearLineStopTimer();

    if (!audio || !currentLine) return;

    audio.pause();
    audio.currentTime = Math.max(0, (currentLine.endMs + manualOffsetMs) / 1000);
    setIsPlaying(false);
  }

  function playCurrentLine() {
    const audio = audioRef.current;
    if (!audio || !currentLine) return;

    clearLineStopTimer();

    const startMs = Math.max(0, currentLine.startMs + manualOffsetMs);
    const endMs = Math.max(startMs + 500, currentLine.endMs + manualOffsetMs);
    const durationMs = endMs - startMs;

    audio.currentTime = startMs / 1000;
    audio.play();
    setIsPlaying(true);

    lineStopTimerRef.current = window.setTimeout(() => {
      stopLinePlayback();
    }, durationMs);
  }

  function pauseAudio() {
    const audio = audioRef.current;
    clearLineStopTimer();

    if (!audio) return;

    audio.pause();
    setIsPlaying(false);
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !currentLine) return;

    const endMs = currentLine.endMs + manualOffsetMs;

    if (audio.currentTime * 1000 >= endMs) {
      stopLinePlayback();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (isComplete || !currentWord) return;

    if (showReview) {
      if (event.key === "Enter") {
        goNextLine();
      }
      return;
    }

    if (event.key === "Backspace") {
      setTyped((prev) => prev.slice(0, -1));
      setFeedback("");
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (isCorrectWord(typed, currentWord.text)) {
        const nextCompleted = [...completedWords, currentWord.text];

        setCompletedWords(nextCompleted);
        setTyped("");
        setFeedback("");
        setScore((prev) => prev + 100);

        if (wordIndex + 1 >= currentLine.words.length) {
          pauseAudio();
          setShowReview(true);
        } else {
          setWordIndex((prev) => prev + 1);
        }
      } else {
        setMistakes((prev) => prev + 1);
        setFeedback("Спробуй ще раз");
      }

      return;
    }

    if (/^[a-zA-Z']$/.test(event.key)) {
      setTyped((prev) => prev + event.key);
      setFeedback("");
    }
  }

  async function finishGame() {
    pauseAudio();
    setIsComplete(true);

    const durationSec = Math.round((Date.now() - startedAtRef.current) / 1000);
    const finalCorrectWords = Math.floor(score / 100);
    const finalAccuracy =
      finalCorrectWords + mistakes === 0
        ? 100
        : Math.round((finalCorrectWords / (finalCorrectWords + mistakes)) * 100);

    if (!sessionSaved) {
      await submitSession({
        songId: song.id,
        mode: "dictation",
        score,
        accuracy: finalAccuracy,
        totalWords,
        correctWords: finalCorrectWords,
        mistakes,
        durationSec,
      });

      setSessionSaved(true);
    }
  }

  function goNextLine() {
    pauseAudio();

    if (lineIndex + 1 >= song.lines.length) {
      finishGame();
      return;
    }

    setLineIndex((prev) => prev + 1);
    setWordIndex(0);
    setTyped("");
    setCompletedWords([]);
    setShowReview(false);
    setFeedback("");
  }

  function goPreviousLine() {
    if (lineIndex === 0) return;

    pauseAudio();
    setLineIndex((prev) => prev - 1);
    setWordIndex(0);
    setTyped("");
    setCompletedWords([]);
    setShowReview(false);
    setFeedback("");
  }

  function skipLine() {
    pauseAudio();
    setShowReview(true);
  }

  function restartSong() {
    pauseAudio();
    startedAtRef.current = Date.now();

    setLineIndex(0);
    setWordIndex(0);
    setTyped("");
    setCompletedWords([]);
    setShowReview(false);
    setIsComplete(false);
    setScore(0);
    setMistakes(0);
    setFeedback("");
    setSessionSaved(false);
  }

  return (
    <main
      ref={gameRef}
      className="min-h-screen bg-[#07070a] text-white outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <audio
        ref={audioRef}
        src={song.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      <header className="flex h-16 items-center justify-between border-b border-white/10 px-8">
        <div className="flex items-center gap-4">
          <Link to="/songs" className="text-slate-400 hover:text-white">
            ← Назад
          </Link>

          <strong>{song.title}</strong>

          <span className="text-slate-400">
            {lineIndex + 1}/{song.lines.length}
          </span>
        </div>

        <div className="font-semibold text-sky-400">Бал {score}</div>
      </header>

      <div className="h-1 bg-white/10">
        <div
          className="h-full bg-sky-400 transition-all"
          style={{
            width: `${((lineIndex + 1) / song.lines.length) * 100}%`,
          }}
        />
      </div>

      <section className="mx-auto flex min-h-[calc(100vh-68px)] max-w-6xl flex-col items-center justify-center px-8 text-center">
        {isComplete ? (
          <CompletionView
            score={score}
            accuracy={accuracy}
            totalWords={totalWords}
            correctWords={correctWords}
            mistakes={mistakes}
            onRestart={restartSong}
          />
        ) : !showReview ? (
          <>
            <p className="mb-12 text-2xl text-slate-300">
              {currentLine.ukrainian}
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-5xl font-semibold">
              {currentLine.words.map((word, index) => {
                const isDone = index < completedWords.length;
                const isActive = index === wordIndex;

                return (
                  <div key={word.order} className="min-w-24">
                    <div
                      className={
                        isActive
                          ? "text-sky-300"
                          : isDone
                          ? "text-white"
                          : "text-transparent"
                      }
                    >
                      {isDone ? word.text : isActive ? typed || "_" : "_"}
                    </div>

                    <div
                      className={
                        isActive
                          ? "mt-2 h-1 rounded-full bg-sky-400"
                          : "mt-2 h-1 rounded-full bg-slate-500"
                      }
                    />
                  </div>
                );
              })}
            </div>

            {feedback && (
              <p className="mt-8 text-sm font-semibold text-rose-400">
                {feedback}
              </p>
            )}

            <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={playCurrentLine}
                className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600"
              >
                {isPlaying
                  ? "Відтворюється..."
                  : lineIndex === 0
                  ? "Пропустити вступ і слухати"
                  : "Прослухати рядок"}
              </button>

              <button
                onClick={pauseAudio}
                className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-slate-300 hover:bg-white/10"
              >
                Пауза
              </button>

              <button
                onClick={() => setManualOffsetMs((prev) => prev - 1000)}
                className="rounded-xl border border-white/10 px-4 py-3 font-semibold text-slate-300 hover:bg-white/10"
              >
                -1с
              </button>

              <button
                onClick={() => setManualOffsetMs((prev) => prev + 1000)}
                className="rounded-xl border border-white/10 px-4 py-3 font-semibold text-slate-300 hover:bg-white/10"
              >
                +1с
              </button>

              <button
                onClick={skipLine}
                className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-slate-300 hover:bg-white/10"
              >
                Пропустити рядок
              </button>
            </div>

            <p className="mt-8 text-sm text-slate-500">
              Введи слово англійською. Натисни Space або Enter для підтвердження.
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Час рядка: {Math.round((currentLine.startMs + manualOffsetMs) / 1000)}с –{" "}
              {Math.round((currentLine.endMs + manualOffsetMs) / 1000)}с · Зсув:{" "}
              {manualOffsetMs / 1000}с
            </p>
          </>
        ) : (
          <>
            <div className="mb-10 flex flex-wrap justify-center gap-6">
              {currentLine.words.map((word) => (
                <div key={word.order} className="text-center">
                  {word.ipa && (
                    <div className="mb-2 rounded bg-white/10 px-2 py-1 text-sm text-slate-300">
                      /{word.ipa}/
                    </div>
                  )}

                  <div className="border-b-4 border-sky-400 text-5xl font-semibold">
                    {word.text}
                  </div>

                  <div className="mt-2 text-sm text-slate-400">{word.pos}</div>

                  <div className="mt-1 text-sm text-slate-300">
                    {word.ukrainian}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-2xl text-slate-300">{currentLine.ukrainian}</p>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <button
                onClick={goPreviousLine}
                className="rounded-xl border border-white/10 px-8 py-4 font-semibold text-slate-300 hover:bg-white/10"
              >
                Попередній рядок
              </button>

              <button
                onClick={goNextLine}
                className="rounded-xl bg-sky-500 px-8 py-4 font-semibold text-white hover:bg-sky-600"
              >
                Наступний рядок
              </button>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Можна також натиснути Enter
            </p>
          </>
        )}
      </section>
    </main>
  );
}

type CompletionViewProps = {
  score: number;
  accuracy: number;
  totalWords: number;
  correctWords: number;
  mistakes: number;
  onRestart: () => void;
};

function CompletionView({
  score,
  accuracy,
  totalWords,
  correctWords,
  mistakes,
  onRestart,
}: CompletionViewProps) {
  return (
    <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-10 shadow-2xl">
      <div className="text-5xl">🎉</div>

      <h1 className="mt-4 text-4xl font-bold">Тренування завершено</h1>

      <p className="mt-3 text-slate-400">
        Ти пройшов пісню і повторив англійські слова в контексті.
      </p>

      <div className="mt-8 text-6xl font-black text-sky-400">{score}</div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Точність" value={`${accuracy}%`} />
        <StatCard label="Слів у пісні" value={String(totalWords)} />
        <StatCard label="Правильно" value={String(correctWords)} />
        <StatCard label="Помилок" value={String(mistakes)} />
      </div>

      <div className="mt-10 flex justify-center gap-4">
        <button
          onClick={onRestart}
          className="rounded-xl bg-sky-500 px-8 py-4 font-semibold text-white hover:bg-sky-600"
        >
          Спробувати ще раз
        </button>

        <Link
          to="/songs"
          className="rounded-xl border border-white/10 px-8 py-4 font-semibold text-slate-300 hover:bg-white/10"
        >
          Обрати іншу пісню
        </Link>
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}