import { useMemo, useState } from "react";
import type { Continent, Country } from "../types";
import { CONTINENT_ORDER, CONTINENTS } from "../lib/continents";
import { int } from "../lib/format";
import { Flag } from "./Flag";
import { CountryShape, hasShape } from "./CountryShape";

type Mode = "capital" | "flag" | "shape" | "population" | "continent";
type Scope = Continent | "All";

const ROUND = 10;

const MODES: { id: Mode; label: string; blurb: string }[] = [
  { id: "capital", label: "Guess the capital", blurb: "See a country → pick its capital city" },
  { id: "flag", label: "Guess the country", blurb: "See a flag → pick the country" },
  { id: "shape", label: "Guess the shape", blurb: "See an outline → pick the country" },
  { id: "population", label: "Guess the population", blurb: "See a country → pick how many people" },
  { id: "continent", label: "Guess the continent", blurb: "See a country → pick its continent" },
];

interface Question {
  country: Country;
  options: string[];
  answer: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sampleUnique(pool: string[], exclude: string, n: number): string[] {
  const out: string[] = [];
  for (const v of shuffle(pool)) {
    if (v === exclude || out.includes(v)) continue;
    out.push(v);
    if (out.length === n) break;
  }
  return out;
}

function buildRound(countries: Country[], mode: Mode, scope: Scope): Question[] {
  const base =
    scope === "All" ? countries : countries.filter((c) => c.continent === scope);
  // shape mode can only ask about countries that actually have a silhouette
  const targetPool = mode === "shape" ? base.filter((c) => hasShape(c.iso2)) : base;
  const targets = shuffle(targetPool).slice(0, Math.min(ROUND, targetPool.length));

  return targets.map((country) => {
    if (mode === "capital") {
      const answer = country.capital;
      const distractors = sampleUnique(base.map((c) => c.capital), answer, 3);
      return { country, answer, options: shuffle([answer, ...distractors]) };
    }
    if (mode === "flag" || mode === "shape") {
      const answer = country.name;
      const distractors = sampleUnique(base.map((c) => c.name), answer, 3);
      return { country, answer, options: shuffle([answer, ...distractors]) };
    }
    if (mode === "population") {
      const answer = int(country.population);
      const distractors = sampleUnique(base.map((c) => int(c.population)), answer, 3);
      return { country, answer, options: shuffle([answer, ...distractors]) };
    }
    // continent
    const answer = country.continent;
    const distractors = sampleUnique(CONTINENT_ORDER as string[], answer, 3);
    return { country, answer, options: shuffle([answer, ...distractors]) };
  });
}

export function Quiz({ countries }: { countries: Country[] }) {
  const [mode, setMode] = useState<Mode>("capital");
  const [scope, setScope] = useState<Scope>("All");
  const [round, setRound] = useState<Question[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const start = () => {
    setRound(buildRound(countries, mode, scope));
    setIdx(0);
    setScore(0);
    setPicked(null);
  };

  const scopes: Scope[] = useMemo(
    () => ["All", ...CONTINENTS.map((c) => c.name)],
    []
  );

  // ---- setup screen ----
  if (!round) {
    return (
      <div className="quiz quiz--setup">
        <h2 className="quiz__title">Quiz time! 🎯</h2>
        <p className="quiz__lead">Pick a game and a region, then play 10 questions.</p>

        <div className="quiz__group">
          <h3 className="quiz__group-title">Game</h3>
          <div className="quiz__modes">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`mode-card${mode === m.id ? " mode-card--active" : ""}`}
                onClick={() => setMode(m.id)}
              >
                <span className="mode-card__label">{m.label}</span>
                <span className="mode-card__blurb">{m.blurb}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="quiz__group">
          <h3 className="quiz__group-title">Region</h3>
          <div className="quiz__scopes">
            {scopes.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip${scope === s ? " chip--active" : ""}`}
                onClick={() => setScope(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="btn btn--primary quiz__start" onClick={start}>
          Start quiz →
        </button>
      </div>
    );
  }

  // ---- results screen ----
  if (idx >= round.length) {
    const pct = Math.round((score / round.length) * 100);
    const cheer =
      pct === 100 ? "Perfect! 🏆" : pct >= 70 ? "Great job! 🎉" : pct >= 40 ? "Nice try! 👍" : "Keep practising! 💪";
    return (
      <div className="quiz quiz--result">
        <h2 className="quiz__title">{cheer}</h2>
        <p className="quiz__score-big">
          {score} / {round.length}
        </p>
        <div className="quiz__result-actions">
          <button type="button" className="btn btn--primary" onClick={start}>
            Play again
          </button>
          <button type="button" className="btn" onClick={() => setRound(null)}>
            Change game
          </button>
        </div>
      </div>
    );
  }

  // ---- question screen ----
  const q = round[idx];
  const answered = picked !== null;

  const pick = (opt: string) => {
    if (answered) return;
    setPicked(opt);
    if (opt === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    setPicked(null);
    setIdx((i) => i + 1);
  };

  return (
    <div className="quiz quiz--play">
      <div className="quiz__bar">
        <span className="quiz__progress">
          Question {idx + 1} / {round.length}
        </span>
        <span className="quiz__score">Score: {score}</span>
      </div>

      <div className="quiz__prompt">
        {mode === "flag" && (
          <>
            <Flag iso2={q.country.iso2} className="quiz__flag" />
            <span className="quiz__prompt-text">Which country has this flag?</span>
          </>
        )}
        {mode === "shape" && (
          <>
            <CountryShape
              iso2={q.country.iso2}
              fill="#eef1f5"
              stroke="#334155"
              strokeWidth={1.4}
              className="quiz__shape-svg"
            />
            <span className="quiz__prompt-text">Which country has this shape?</span>
          </>
        )}
        {(mode === "capital" || mode === "population" || mode === "continent") && (
          <>
            <Flag iso2={q.country.iso2} className="quiz__prompt-flag" />
            <span className="quiz__prompt-text">
              {mode === "capital"
                ? `What is the capital of ${q.country.name}?`
                : mode === "population"
                ? `About how many people live in ${q.country.name}?`
                : `Which continent is ${q.country.name} in?`}
            </span>
          </>
        )}
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
            <button
              key={opt}
              type="button"
              className={cls}
              onClick={() => pick(opt)}
              disabled={answered}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div className="quiz__footer">
        {answered ? (
          <button type="button" className="btn btn--primary" onClick={next}>
            {idx + 1 === round.length ? "See results →" : "Next →"}
          </button>
        ) : (
          <span className="quiz__hint">Tap an answer</span>
        )}
      </div>
    </div>
  );
}
