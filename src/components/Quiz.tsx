import { useMemo, useState } from "react";
import type { Continent, Country } from "../types";
import { CONTINENT_ORDER, CONTINENTS } from "../lib/continents";
import { int } from "../lib/format";
import {
  continentLabel,
  displayCapital,
  displayName,
  useLang,
  useT,
  type Lang,
  type StringKey,
} from "../lib/i18n";
import { Flag } from "./Flag";
import { CountryShape, hasShape } from "./CountryShape";
import { FindGame } from "./FindGame";
import { FlagMatchGame } from "./FlagMatchGame"; // CHANGED
import { UkraineQuiz } from "./UkraineQuiz"; // CHANGED

type Mode = "capital" | "flag" | "shape" | "population" | "continent" | "where" | "match"; // CHANGED
type Scope = Continent | "All";

const ROUND = 10;
const WORLD_MODE_IDS: Mode[] = ["capital", "flag", "shape", "population", "continent", "where", "match"]; // CHANGED
const MODE_IDS = WORLD_MODE_IDS; // alias kept for existing code

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

function buildRound(countries: Country[], mode: Mode, scope: Scope, lang: Lang): Question[] {
  const base = scope === "All" ? countries : countries.filter((c) => c.continent === scope);
  const targetPool = mode === "shape" ? base.filter((c) => hasShape(c.iso2)) : base;
  const targets = shuffle(targetPool).slice(0, Math.min(ROUND, targetPool.length));

  return targets.map((country) => {
    if (mode === "capital") {
      const answer = displayCapital(lang, country);
      const distractors = sampleUnique(base.map((c) => displayCapital(lang, c)), answer, 3);
      return { country, answer, options: shuffle([answer, ...distractors]) };
    }
    if (mode === "flag" || mode === "shape") {
      const answer = displayName(lang, country);
      const distractors = sampleUnique(base.map((c) => displayName(lang, c)), answer, 3);
      return { country, answer, options: shuffle([answer, ...distractors]) };
    }
    if (mode === "population") {
      const answer = int(country.population);
      const distractors = sampleUnique(base.map((c) => int(c.population)), answer, 3);
      return { country, answer, options: shuffle([answer, ...distractors]) };
    }
    const answer = country.continent;
    const distractors = sampleUnique(CONTINENT_ORDER as string[], answer, 3);
    return { country, answer, options: shuffle([answer, ...distractors]) };
  });
}

const cheerKey = (pct: number): StringKey =>
  pct === 100 ? "cheer.perfect" : pct >= 70 ? "cheer.great" : pct >= 40 ? "cheer.nice" : "cheer.keep";

export function Quiz({ countries }: { countries: Country[] }) {
  const t = useT();
  const { lang } = useLang();
  const [mode, setMode] = useState<Mode>("capital");
  const [scope, setScope] = useState<Scope>("All");
  const [round, setRound] = useState<Question[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [playWhere, setPlayWhere] = useState(false);
  const [playMatch, setPlayMatch] = useState(false); // CHANGED
  const [playUa, setPlayUa] = useState(false); // CHANGED

  const start = () => {
    if (mode === "where") {
      setPlayWhere(true);
      return;
    }
    if (mode === "match") { // CHANGED
      setPlayMatch(true); // CHANGED
      return; // CHANGED
    } // CHANGED
    setRound(buildRound(countries, mode, scope, lang));
    setIdx(0);
    setScore(0);
    setPicked(null);
  };

  const scopes: Scope[] = useMemo(() => ["All", ...CONTINENTS.map((c) => c.name)], []);
  const scopeLabel = (s: Scope) => (s === "All" ? t("quiz.scope.all") : continentLabel(lang, s));

  if (playWhere) {
    return <FindGame countries={countries} scope={scope} onExit={() => setPlayWhere(false)} />;
  }
  if (playMatch) { // CHANGED
    return <FlagMatchGame countries={countries} scope={scope} onExit={() => setPlayMatch(false)} />; // CHANGED
  } // CHANGED
  if (playUa) { // CHANGED
    return <UkraineQuiz onExit={() => setPlayUa(false)} />; // CHANGED
  } // CHANGED

  // ---- setup ----
  if (!round) {
    return (
      <div className="quiz quiz--setup">
        <h2 className="quiz__title">{t("quiz.title")}</h2>
        <p className="quiz__lead">{t("quiz.lead")}</p>

        <div className="quiz__group">
          <h3 className="quiz__group-title">{t("quiz.game")}</h3>
          <div className="quiz__modes">
            {MODE_IDS.map((m) => (
              <button
                key={m}
                type="button"
                className={`mode-card${mode === m ? " mode-card--active" : ""}`}
                onClick={() => setMode(m)}
              >
                <span className="mode-card__label">{t(`mode.${m}` as StringKey)}</span>
                <span className="mode-card__blurb">{t(`mode.${m}.b` as StringKey)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="quiz__group">
          <h3 className="quiz__group-title">{t("quiz.region")}</h3>
          <div className="quiz__scopes">
            {scopes.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip${scope === s ? " chip--active" : ""}`}
                onClick={() => setScope(s)}
              >
                {scopeLabel(s)}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="btn btn--primary quiz__start" onClick={start}>
          {t("quiz.start")}
        </button>

        <div className="quiz__group" style={{ marginTop: 28 }}> {/* CHANGED */}
          <h3 className="quiz__group-title">{t("quiz.ukraine")}</h3> {/* CHANGED */}
          <button type="button" className="mode-card" onClick={() => setPlayUa(true)}> {/* CHANGED */}
            <span className="mode-card__label">{t("quiz.ukraine.label")}</span> {/* CHANGED */}
            <span className="mode-card__blurb">{t("quiz.ukraine.blurb")}</span> {/* CHANGED */}
          </button> {/* CHANGED */}
        </div> {/* CHANGED */}
      </div>
    );
  }

  // ---- results ----
  if (idx >= round.length) {
    const pct = Math.round((score / round.length) * 100);
    return (
      <div className="quiz quiz--result">
        <h2 className="quiz__title">{t(cheerKey(pct))}</h2>
        <p className="quiz__score-big">
          {score} / {round.length}
        </p>
        <div className="quiz__result-actions">
          <button type="button" className="btn btn--primary" onClick={start}>
            {t("quiz.playAgain")}
          </button>
          <button type="button" className="btn" onClick={() => setRound(null)}>
            {t("quiz.changeGame")}
          </button>
        </div>
      </div>
    );
  }

  // ---- question ----
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
          {t("quiz.progress", { i: idx + 1, n: round.length })}
        </span>
        <span className="quiz__score">{t("quiz.score", { s: score })}</span>
      </div>

      <div className="quiz__prompt">
        {mode === "flag" && (
          <>
            <Flag iso2={q.country.iso2} className="quiz__flag" />
            <span className="quiz__prompt-text">{t("quiz.askFlag")}</span>
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
            <span className="quiz__prompt-text">{t("quiz.askShape")}</span>
          </>
        )}
        {(mode === "capital" || mode === "population" || mode === "continent") && (
          <>
            <Flag iso2={q.country.iso2} className="quiz__prompt-flag" />
            <span className="quiz__prompt-text">
              {mode === "capital"
                ? t("quiz.askCapital", { x: displayName(lang, q.country) })
                : mode === "population"
                ? t("quiz.askPopulation", { x: displayName(lang, q.country) })
                : t("quiz.askContinent", { x: displayName(lang, q.country) })}
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
            <button key={opt} type="button" className={cls} onClick={() => pick(opt)} disabled={answered}>
              {mode === "continent" ? continentLabel(lang, opt as Continent) : opt}
            </button>
          );
        })}
      </div>

      <div className="quiz__footer">
        {answered ? (
          <button type="button" className="btn btn--primary" onClick={next}>
            {idx + 1 === round.length ? t("quiz.results") : t("quiz.next")}
          </button>
        ) : (
          <span className="quiz__hint">{t("quiz.tap")}</span>
        )}
      </div>
    </div>
  );
}
