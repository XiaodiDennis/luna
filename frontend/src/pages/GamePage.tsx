import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
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
  syncOffsetMs?: number;
  lines: LyricLine[];
};

type PosStyle = {
  labelUk: string;
  text: string;
  border: string;
  bg: string;
  chip: string;
};

const POS_STYLES: Record<string, PosStyle> = {
  determiner: {
    labelUk: "артикль / означник",
    text: "text-amber-300",
    border: "border-amber-400",
    bg: "bg-amber-400/10",
    chip: "bg-amber-400/15 text-amber-200",
  },
  pronoun: {
    labelUk: "займенник",
    text: "text-rose-300",
    border: "border-rose-400",
    bg: "bg-rose-400/10",
    chip: "bg-rose-400/15 text-rose-200",
  },
  noun: {
    labelUk: "іменник",
    text: "text-sky-300",
    border: "border-sky-400",
    bg: "bg-sky-400/10",
    chip: "bg-sky-400/15 text-sky-200",
  },
  verb: {
    labelUk: "дієслово",
    text: "text-emerald-300",
    border: "border-emerald-400",
    bg: "bg-emerald-400/10",
    chip: "bg-emerald-400/15 text-emerald-200",
  },
  auxiliary: {
    labelUk: "допоміжне дієслово",
    text: "text-indigo-300",
    border: "border-indigo-400",
    bg: "bg-indigo-400/10",
    chip: "bg-indigo-400/15 text-indigo-200",
  },
  adjective: {
    labelUk: "прикметник",
    text: "text-violet-300",
    border: "border-violet-400",
    bg: "bg-violet-400/10",
    chip: "bg-violet-400/15 text-violet-200",
  },
  adverb: {
    labelUk: "прислівник",
    text: "text-orange-300",
    border: "border-orange-400",
    bg: "bg-orange-400/10",
    chip: "bg-orange-400/15 text-orange-200",
  },
  preposition: {
    labelUk: "прийменник",
    text: "text-cyan-300",
    border: "border-cyan-400",
    bg: "bg-cyan-400/10",
    chip: "bg-cyan-400/15 text-cyan-200",
  },
  conjunction: {
    labelUk: "сполучник",
    text: "text-pink-300",
    border: "border-pink-400",
    bg: "bg-pink-400/10",
    chip: "bg-pink-400/15 text-pink-200",
  },
  default: {
    labelUk: "слово",
    text: "text-slate-200",
    border: "border-slate-500",
    bg: "bg-white/5",
    chip: "bg-white/10 text-slate-200",
  },
};

function getPosKey(pos?: string) {
  const value = (pos ?? "").toLowerCase();

  if (value.includes("determiner") || value.includes("article") || value === "det") {
    return "determiner";
  }

  if (value.includes("pronoun")) return "pronoun";
  if (value.includes("noun")) return "noun";

  if (
    value.includes("auxiliary") ||
    value.includes("modal") ||
    value === "aux"
  ) {
    return "auxiliary";
  }

  if (value.includes("verb")) return "verb";
  if (value.includes("adjective") || value === "adj") return "adjective";
  if (value.includes("adverb") || value === "adv") return "adverb";
  if (value.includes("preposition") || value === "prep") return "preposition";
  if (value.includes("conjunction") || value === "conj") return "conjunction";

  return "default";
}

function getPosStyle(pos?: string) {
  return POS_STYLES[getPosKey(pos)] ?? POS_STYLES.default;
}

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
    ipa: "",
    pos: "",
    ukrainian: "",
  }));
}

function formatOffset(ms: number) {
  const seconds = ms / 1000;

  if (seconds === 0) return "0.0с";
  return `${seconds > 0 ? "+" : ""}${seconds.toFixed(1)}с`;
}

function getLineStartSec(line: LyricLine, offsetMs: number) {
  return Math.max(0, (line.startMs + offsetMs) / 1000);
}

function getLineEndSec(line: LyricLine, offsetMs: number) {
  const shiftedStart = getLineStartSec(line, offsetMs);
  const shiftedEnd = Math.max(shiftedStart + 0.2, (line.endMs + offsetMs) / 1000);

  return shiftedEnd;
}

export function GamePage() {
  const { songId } = useParams();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeInputRef = useRef<HTMLInputElement | null>(null);
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
  const [isPlayingLine, setIsPlayingLine] = useState(false);
  const [timelineOffsetMs, setTimelineOffsetMs] = useState(0);
  const [feedbackText, setFeedbackText] = useState("Прослухай рядок і введи слова англійською.");

  useEffect(() => {
    let cancelled = false;

    async function loadSong() {
      if (!songId) return;

      const loadedSong = (await getSong(songId)) as unknown as Song;

      if (cancelled) return;

      const sortedSong = {
        ...loadedSong,
        lines: [...loadedSong.lines].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        ),
      };

      setSong(sortedSong);
      setTimelineOffsetMs(sortedSong.syncOffsetMs ?? 0);
    }

    loadSong();

    return () => {
      cancelled = true;
    };
  }, [songId]);

  const currentLine = song?.lines[lineIndex] ?? null;
  const previousLine = song && lineIndex > 0 ? song.lines[lineIndex - 1] : null;
  const nextLine =
    song && lineIndex + 1 < song.lines.length ? song.lines[lineIndex + 1] : null;

  const currentWords = useMemo(() => {
    return currentLine ? splitWords(currentLine) : [];
  }, [currentLine]);

  const progressPercent = song
    ? Math.round((lineIndex / Math.max(1, song.lines.length)) * 100)
    : 0;

  useEffect(() => {
    activeInputRef.current?.focus();
  }, [revealedWords.length, lineIndex, isLineComplete]);

  useEffect(() => {
    if (!currentLine || !audioRef.current) return;

    const audio = audioRef.current;

    function handleTimeUpdate() {
      if (!currentLine || !audioRef.current) return;

      const endSec = getLineEndSec(currentLine, timelineOffsetMs);

      if (audioRef.current.currentTime >= endSec) {
        audioRef.current.pause();
        setIsPlayingLine(false);
        setFeedbackText("Рядок зупинено. Тепер введи слова.");
      }
    }

    function handlePause() {
      setIsPlayingLine(false);
    }

    function handlePlay() {
      setIsPlayingLine(true);
    }

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, [currentLine, timelineOffsetMs]);

  async function playCurrentLine() {
    if (!currentLine || !audioRef.current) return;

    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = getLineStartSec(currentLine, timelineOffsetMs);

    try {
      await audio.play();
      setFeedbackText("Слухай цей рядок. Після завершення він зупиниться автоматично.");
    } catch {
      setFeedbackText("Браузер заблокував автоматичне відтворення. Натисни кнопку ще раз.");
    }
  }

  function pauseAudio() {
    audioRef.current?.pause();
    setIsPlayingLine(false);
  }

  function adjustTimeline(deltaMs: number) {
    pauseAudio();
    setTimelineOffsetMs((previous) => previous + deltaMs);
    setFeedbackText("Таймінг змінено. Прослухай рядок ще раз.");
  }

  function resetTimeline() {
    pauseAudio();
    setTimelineOffsetMs(song?.syncOffsetMs ?? 0);
    setFeedbackText("Таймінг повернуто до початкового значення.");
  }

  function resetLineState(nextIndex: number) {
    pauseAudio();
    setLineIndex(nextIndex);
    setTypedWord("");
    setRevealedWords([]);
    setIsLineComplete(false);
    setFeedbackText("Прослухай рядок і введи слова англійською.");

    const targetLine = song?.lines[nextIndex];

    if (targetLine && audioRef.current) {
      audioRef.current.currentTime = getLineStartSec(targetLine, timelineOffsetMs);
    }
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

      if (nextRevealedWords.length === currentWords.length) {
        setIsLineComplete(true);
        pauseAudio();
        setFeedbackText("Рядок завершено. Переглянь слова і переходь далі.");
      } else {
        setFeedbackText("Правильно. Введи наступне слово.");
      }

      return;
    }

    setMistakes((previous) => previous + 1);
    setScore((previous) => Math.max(0, previous - 25));
    setTypedWord("");
    setFeedbackText("Неправильно. Спробуй це слово ще раз.");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      checkWord();
    }
  }

  function revealCurrentLine() {
    if (!currentLine) return;

    const allWords = currentWords.map((word) => word.text);
    const missingWords = Math.max(0, allWords.length - revealedWords.length);

    setRevealedWords(allWords);
    setMistakes((previous) => previous + missingWords);
    setIsLineComplete(true);
    pauseAudio();
    setFeedbackText("Рядок відкрито. Переглянь пояснення та переходь далі.");
  }

  async function saveResultIfNeeded(finalSong: Song) {
    if (isSaving) return;

    setIsSaving(true);

    try {
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
    } finally {
      setIsSaving(false);
    }
  }

  async function finishOrNextLine() {
    if (!song) return;

    if (lineIndex + 1 >= song.lines.length) {
      pauseAudio();
      setIsFinished(true);
      await saveResultIfNeeded(song);
      return;
    }

    resetLineState(lineIndex + 1);
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

  const activeWordIndex = revealedWords.length;
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

      <section className="mx-auto grid max-w-7xl gap-8 px-8 py-8 lg:grid-cols-[260px_1fr_260px]">
        <SidePrompt
          title="Попередній рядок"
          line={previousLine}
          buttonText="← Назад"
          disabled={!previousLine}
          onClick={() => {
            if (lineIndex > 0) resetLineState(lineIndex - 1);
          }}
        />

        <div className="flex min-h-[calc(100vh-156px)] flex-col items-center justify-center text-center">
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            Зміщення таймінгу:{" "}
            <span className="font-bold text-sky-300">
              {formatOffset(timelineOffsetMs)}
            </span>
          </div>

          <p className="mt-8 text-2xl font-semibold text-slate-300">
            {safeCurrentLine.ukrainian}
          </p>

          <div className="mt-14 flex max-w-5xl flex-wrap items-end justify-center gap-x-4 gap-y-8">
            {currentWords.map((word, index) => {
              const posStyle = getPosStyle(word.pos);
              const isRevealed = index < revealedWords.length;
              const isActive = index === activeWordIndex && !isLineComplete;
              const shouldShowWord = isRevealed || isLineComplete;
              const inputWidth = Math.max(86, Math.min(180, word.text.length * 22 + 42));

              return (
                <div
                  key={`${word.text}_${index}`}
                  className={`rounded-2xl px-2 py-2 ${isActive ? posStyle.bg : ""}`}
                  style={{ width: inputWidth }}
                >
                  <div className="mb-2 min-h-7 rounded-md bg-white/10 px-2 py-1 text-xs text-slate-300">
                    {isLineComplete && word.ipa ? word.ipa : ""}
                  </div>

                  <div
                    className={`flex h-16 items-center justify-center border-b-4 pb-2 text-4xl font-black ${posStyle.border}`}
                  >
                    {shouldShowWord && (
                      <span className={posStyle.text}>{word.text}</span>
                    )}

                    {isActive && (
                      <input
                        ref={activeInputRef}
                        value={typedWord}
                        onChange={(event) => setTypedWord(event.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`w-full bg-transparent text-center text-4xl font-black outline-none placeholder:text-white/20 ${posStyle.text}`}
                        placeholder=""
                        autoCapitalize="none"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    )}
                  </div>

                  {(isLineComplete || isRevealed) && (
                    <div className="mt-2 min-h-12 text-sm leading-5 text-slate-400">
                      <div
                        className={`mx-auto mb-1 w-fit rounded-full px-2 py-0.5 text-xs ${posStyle.chip}`}
                      >
                        {word.pos || posStyle.labelUk}
                      </div>
                      <div>{word.ukrainian || "—"}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-slate-400">{feedbackText}</p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={playCurrentLine}
              className="rounded-xl bg-sky-500 px-7 py-4 font-semibold text-white hover:bg-sky-600"
            >
              {isPlayingLine ? "Відтворюється..." : "Прослухати рядок"}
            </button>

            <button
              onClick={pauseAudio}
              className="rounded-xl border border-white/10 px-7 py-4 font-semibold text-slate-300 hover:bg-white/10"
            >
              Пауза
            </button>

            {!isLineComplete && (
              <button
                onClick={revealCurrentLine}
                className="rounded-xl border border-white/10 px-7 py-4 font-semibold text-slate-300 hover:bg-white/10"
              >
                Показати відповідь
              </button>
            )}

            {isLineComplete && (
              <button
                onClick={finishOrNextLine}
                className="rounded-xl bg-emerald-500 px-7 py-4 font-semibold text-white hover:bg-emerald-600"
              >
                {lineIndex + 1 >= song.lines.length
                  ? "Завершити"
                  : "Наступний рядок"}
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => adjustTimeline(-1000)}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10"
            >
              Аудіо −1с
            </button>

            <button
              onClick={() => adjustTimeline(1000)}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10"
            >
              Аудіо +1с
            </button>

            <button
              onClick={resetTimeline}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10"
            >
              Скинути таймінг
            </button>
          </div>

          <div className="mt-8 text-sm text-slate-500">
            Вводь слово прямо на горизонтальній лінії. Натисни Space або Enter
            для підтвердження. Після прослуховування рядок зупиняється автоматично.
          </div>
        </div>

        <SidePrompt
          title="Наступний рядок"
          line={nextLine}
          buttonText="Далі →"
          disabled={!nextLine}
          onClick={() => {
            if (lineIndex + 1 < song.lines.length) resetLineState(lineIndex + 1);
          }}
        />
      </section>
    </main>
  );
}

function SidePrompt({
  title,
  line,
  buttonText,
  disabled,
  onClick,
}: {
  title: string;
  line: LyricLine | null;
  buttonText: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <aside className="hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-left lg:block">
      <div className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
        {title}
      </div>

      {line ? (
        <>
          <p className="mt-5 text-lg font-semibold text-slate-200">
            {line.ukrainian}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {line.english}
          </p>
        </>
      ) : (
        <p className="mt-5 text-sm leading-6 text-slate-500">
          Немає рядка для показу.
        </p>
      )}

      <button
        onClick={onClick}
        disabled={disabled}
        className="mt-6 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {buttonText}
      </button>
    </aside>
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
