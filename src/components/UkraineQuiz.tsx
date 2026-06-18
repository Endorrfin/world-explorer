import { useState, useMemo } from "react";
import regionsData from "../data/ukraine_regions.json";
import { OBLASTS, OBLASTS_MAP, type Oblast } from "../data/oblasts";
import { useLang } from "../lib/i18n";

interface Region {
  id: string;
  name: string;
  ie: number;
  iu: number;
  d: string;
}
const REGIONS = regionsData as { w: number; h: number; regions: Region[] };

const ROUND = 8;
const QUIZ_MODES = ["map", "capital", "facts"] as const;
type UaMode = (typeof QUIZ_MODES)[number];

const T = {
  en: {
    title: "Ukraine Quiz 🇺🇦",
    pickMode: "Choose a game",
    "mode.map": "Find the oblast",
    "mode.map.b": "Read the name → click it on the map",
    "mode.capital": "Guess the capital",
    "mode.capital.b": "See an oblast → pick its administrative centre",
    "mode.facts": "Did you know?",
    "mode.facts.b": "Read a fun fact → name the oblast",
    start: "Start →",
    score: "Score: {s}",
    progress: "Question {i} / {n}",
    hint: "Tap an answer",
    next: "Next →",
    results: "See results →",
    playAgain: "Play again",
    changeGame: "Change game",
    mapHintTarget: "Click {x} on the map",
    mapHintGeneral: "Click the matching oblast",
    askCapital: "What is the administrative centre of {x}?",
    askFact: "Which oblast is described here?",
    correct: "Correct! 🎉",
    wrong: "Not quite — the answer was {x}",
    perfect: "Perfect! 🏆",
    great: "Great job! 🎉",
    nice: "Nice try! 👍",
    keep: "Keep practising! 💪",
  },
  uk: {
    title: "Квіз про Україну 🇺🇦",
    pickMode: "Обери гру",
    "mode.map": "Знайди область",
    "mode.map.b": "Читай назву → клікни на карті",
    "mode.capital": "Вгадай центр",
    "mode.capital.b": "Бачиш область → обери її адміністративний центр",
    "mode.facts": "Чи знав ти?",
    "mode.facts.b": "Читай факт → назви область",
    start: "Почати →",
    score: "Рахунок: {s}",
    progress: "Питання {i} / {n}",
    hint: "Обери відповідь",
    next: "Далі →",
    results: "Результати →",
    playAgain: "Грати ще",
    changeGame: "Інша гра",
    mapHintTarget: "Клікни {x} на карті",
    mapHintGeneral: "Клікни відповідну область",
    askCapital: "Який адміністративний центр {x}?",
    askFact: "Про яку область цей факт?",
    correct: "Правильно! 🎉",
    wrong: "Майже — правильна відповідь: {x}",
    perfect: "Ідеально! 🏆",
    great: "Чудово! 🎉",
    nice: "Непогано! 👍",
    keep: "Тренуйся ще! 💪",
  },
} as const;

type TLang = "en" | "uk";

function tr(lang: TLang, key: keyof (typeof T)["en"], params?: Record<string, string>): string {
  let s: string = T[lang][key];
  if (params) for (const [k, v] of Object.entries(params)) s = s.replace(`{${k}}`, v);
  return s;
}

function shuffle<A>(arr: A[]): A[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sampleUniq(pool: string[], exclude: string, n: number): string[] {
  const out: string[] = [];
  for (const v of shuffle(pool)) {
    if (v === exclude || out.includes(v)) continue;
    out.push(v);
    if (out.length === n) break;
  }
  return out;
}

const obName = (lang: TLang, o: Oblast) => (lang === "uk" ? o.nameUk : o.name);
const obCapital = (lang: TLang, o: Oblast) => (lang === "uk" ? o.capitalUk : o.capital);
const obFact = (lang: TLang, o: Oblast) => (lang === "uk" ? o.knownForUk : o.knownFor);

const cheerKey = (pct: number): keyof (typeof T)["en"] =>
  pct === 100 ? "perfect" : pct >= 70 ? "great" : pct >= 40 ? "nice" : "keep";

/* ------------------------------------------------------------------ */
/* Results screen (shared)                                             */
/* ------------------------------------------------------------------ */
function Results({ score, total, lang, onExit }: { score: number; total: number; lang: TLang; onExit: () => void }) {
  const pct = Math.round((score / total) * 100);
  return (
    <div className="quiz quiz--result">
      <h2 className="quiz__title">{tr(lang, cheerKey(pct))}</h2>
      <p className="quiz__score-big">{score} / {total}</p>
      <div className="quiz__result-actions">
        <button type="button" className="btn btn--primary" onClick={onExit}>{tr(lang, "playAgain")}</button>
        <button type="button" className="btn" onClick={onExit}>{tr(lang, "changeGame")}</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Map-click game                                                      */
/* ------------------------------------------------------------------ */
function MapGame({ onExit, lang }: { onExit: () => void; lang: TLang }) {
  const round = useMemo(() => shuffle(OBLASTS_MAP).slice(0, ROUND), []);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  if (idx >= round.length) return <Results score={score} total={round.length} lang={lang} onExit={onExit} />;

  const target = round[idx];
  const answered = picked !== null;
  const correct = picked === target.id;

  const handleClick = (id: string) => {
    if (answered) return;
    setPicked(id);
    if (id === target.id) setScore((s) => s + 1);
  };

  const next = () => { setPicked(null); setIdx((i) => i + 1); };

  const hoverOblast = hoverId ? OBLASTS_MAP.find((o) => o.id === hoverId) : null;

  return (
    <div className="quiz quiz--ua-map">
      <div className="quiz__bar">
        <span className="quiz__progress">{tr(lang, "progress", { i: String(idx + 1), n: String(round.length) })}</span>
        <span className="quiz__score">{tr(lang, "score", { s: String(score) })}</span>
      </div>
      <p className="quiz__prompt-text" style={{ textAlign: "center", marginBottom: 12 }}>
        {tr(lang, "mapHintTarget", { x: obName(lang, target) })}
      </p>
      <div className="ua-map-wrap">
        {!answered && hoverOblast && (
          <div className="ua-map-tooltip">{obName(lang, hoverOblast)}</div>
        )}
        <svg
          className="ua-mapsvg"
          viewBox={`0 0 ${REGIONS.w} ${REGIONS.h}`}
          role="img"
          aria-label="Map of Ukraine oblasts"
        >
          {REGIONS.regions.map((r) => {
            const obl = OBLASTS_MAP.find((o) => o.id === r.id);
            if (!obl) return null;
            let fill: string | undefined;
            if (answered) {
              if (r.id === target.id) fill = "var(--good)";
              else if (r.id === picked) fill = "var(--bad)";
            }
            return (
              <path
                key={r.id}
                d={r.d}
                className="ua-region"
                style={{ fill }}
                role="button"
                aria-label={r.name}
                tabIndex={0}
                onClick={() => handleClick(r.id)}
                onMouseEnter={() => setHoverId(r.id)}
                onMouseLeave={() => setHoverId(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(r.id); }
                }}
              />
            );
          })}
        </svg>
      </div>
      <div className="quiz__footer" style={{ marginTop: 14 }}>
        {answered ? (
          <>
            <span className={`find__verdict ${correct ? "find__verdict--ok" : "find__verdict--no"}`}>
              {correct ? tr(lang, "correct") : tr(lang, "wrong", { x: obName(lang, target) })}
            </span>
            <button type="button" className="btn btn--primary" onClick={next}>
              {idx + 1 === round.length ? tr(lang, "results") : tr(lang, "next")}
            </button>
          </>
        ) : (
          <span className="quiz__hint">{tr(lang, "mapHintGeneral")}</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MCQ game (capital + facts)                                          */
/* ------------------------------------------------------------------ */
interface McqQ {
  oblast: Oblast;
  prompt: string;
  answer: string;
  options: string[];
}

function McqGame({ questions, onExit, lang }: { questions: McqQ[]; onExit: () => void; lang: TLang }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  if (idx >= questions.length) return <Results score={score} total={questions.length} lang={lang} onExit={onExit} />;

  const q = questions[idx];
  const answered = picked !== null;

  const pick = (opt: string) => {
    if (answered) return;
    setPicked(opt);
    if (opt === q.answer) setScore((s) => s + 1);
  };
  const next = () => { setPicked(null); setIdx((i) => i + 1); };

  return (
    <div className="quiz quiz--play">
      <div className="quiz__bar">
        <span className="quiz__progress">{tr(lang, "progress", { i: String(idx + 1), n: String(questions.length) })}</span>
        <span className="quiz__score">{tr(lang, "score", { s: String(score) })}</span>
      </div>
      <div className="quiz__prompt">
        <span className="quiz__prompt-text">{q.prompt}</span>
      </div>
      <div className="quiz__options">
        {q.options.map((opt) => {
          let cls = "option";
          if (answered) {
            if (opt === q.answer) cls += " option--correct";
            else if (opt === picked) cls += " option--wrong";
            else cls += " option--dim";
          }
          return (
            <button key={opt} type="button" className={cls} onClick={() => pick(opt)} disabled={answered}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="quiz__footer">
        {answered ? (
          <button type="button" className="btn btn--primary" onClick={next}>
            {idx + 1 === questions.length ? tr(lang, "results") : tr(lang, "next")}
          </button>
        ) : (
          <span className="quiz__hint">{tr(lang, "hint")}</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Top-level: setup + routing                                          */
/* ------------------------------------------------------------------ */
export function UkraineQuiz({ onExit }: { onExit: () => void }) {
  const { lang: gLang } = useLang();
  const lang: TLang = gLang === "uk" ? "uk" : "en";

  const [selected, setSelected] = useState<UaMode>("map");
  const [active, setActive] = useState<UaMode | null>(null);

  // Pre-build MCQ rounds once so they survive re-renders during a game
  const capitalQs = useMemo<McqQ[]>(() => {
    const pool = shuffle(OBLASTS).slice(0, ROUND);
    return pool.map((o) => {
      const answer = obCapital(lang, o);
      const dist = sampleUniq(OBLASTS.map((x) => obCapital(lang, x)), answer, 3);
      return { oblast: o, prompt: tr(lang, "askCapital", { x: obName(lang, o) }), answer, options: shuffle([answer, ...dist]) };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const factsQs = useMemo<McqQ[]>(() => {
    const pool = shuffle(OBLASTS).slice(0, ROUND);
    return pool.map((o) => {
      const answer = obName(lang, o);
      const dist = sampleUniq(OBLASTS.map((x) => obName(lang, x)), answer, 3);
      return { oblast: o, prompt: obFact(lang, o), answer, options: shuffle([answer, ...dist]) };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const handleExit = () => setActive(null);

  if (active === "map")     return <MapGame onExit={handleExit} lang={lang} />;
  if (active === "capital") return <McqGame questions={capitalQs} onExit={handleExit} lang={lang} />;
  if (active === "facts")   return <McqGame questions={factsQs} onExit={handleExit} lang={lang} />;

  return (
    <div className="quiz quiz--setup">
      <h2 className="quiz__title">{tr(lang, "title")}</h2>
      <p className="quiz__lead">{tr(lang, "pickMode")}</p>
      <div className="quiz__group">
        <div className="quiz__modes">
          {QUIZ_MODES.map((m) => (
            <button
              key={m}
              type="button"
              className={`mode-card${selected === m ? " mode-card--active" : ""}`}
              onClick={() => setSelected(m)}
            >
              <span className="mode-card__label">{tr(lang, `mode.${m}` as keyof (typeof T)["en"])}</span>
              <span className="mode-card__blurb">{tr(lang, `mode.${m}.b` as keyof (typeof T)["en"])}</span>
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="btn btn--primary quiz__start" onClick={() => setActive(selected)}>
        {tr(lang, "start")}
      </button>
      <button type="button" className="btn" style={{ width: "100%", marginTop: 10 }} onClick={onExit}>
        ← {tr(lang, "changeGame")}
      </button>
    </div>
  );
}
