import { useMemo, useState } from "react";
import type { Continent, Country } from "../types";
import { continentLabel, useLang, useT, type StringKey } from "../lib/i18n";
import { Flag } from "./Flag";
import { WorldMap } from "./WorldMap";

type Scope = Continent | "All";
const ROUND = 8;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const cheerKey = (pct: number): StringKey =>
  pct === 100 ? "cheer.perfect" : pct >= 70 ? "cheer.great" : pct >= 40 ? "cheer.nice" : "cheer.keep";

/**
 * "Where in the world?" — the child reads a country name and clicks it on the
 * real map. Reuses <WorldMap> in game mode (feedback colours + forced markers).
 */
export function FindGame({
  countries,
  scope,
  onExit,
}: {
  countries: Country[];
  scope: Scope;
  onExit: () => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const pool = useMemo(
    () => (scope === "All" ? countries : countries.filter((c) => c.continent === scope)),
    [countries, scope]
  );

  const [round, setRound] = useState<Country[]>(() => shuffle(pool).slice(0, Math.min(ROUND, pool.length)));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const restart = () => {
    setRound(shuffle(pool).slice(0, Math.min(ROUND, pool.length)));
    setIdx(0);
    setScore(0);
    setPicked(null);
  };

  if (idx >= round.length) {
    const pct = Math.round((score / round.length) * 100);
    return (
      <div className="find find--result">
        <h2 className="quiz__title">{t(cheerKey(pct))}</h2>
        <p className="quiz__score-big">
          {score} / {round.length}
        </p>
        <div className="quiz__result-actions">
          <button type="button" className="btn btn--primary" onClick={restart}>
            {t("quiz.playAgain")}
          </button>
          <button type="button" className="btn" onClick={onExit}>
            {t("quiz.changeGame")}
          </button>
        </div>
      </div>
    );
  }

  const target = round[idx];
  const answered = picked !== null;
  const correct = answered && picked === target.iso2;
  const pickedCountry = picked ? countries.find((c) => c.iso2 === picked) : null;

  const feedback: Record<string, "correct" | "wrong"> = !answered
    ? {}
    : correct
    ? { [target.iso2]: "correct" }
    : { [target.iso2]: "correct", [picked as string]: "wrong" };

  const guess = (iso: string) => {
    if (answered) return;
    setPicked(iso);
    if (iso === target.iso2) setScore((s) => s + 1);
  };
  const next = () => {
    setPicked(null);
    setIdx((i) => i + 1);
  };

  return (
    <div className="find">
      <div className="find__bar">
        <div className="find__prompt">
          <span className="find__label">{t("find.label")}</span>
          <Flag iso2={target.iso2} className="find__flag" />
          <span className="find__name">{target.name}</span>
          <span className="find__cont">{continentLabel(lang, target.continent)}</span>
        </div>
        <div className="find__meta">
          <span>
            {idx + 1} / {round.length}
          </span>
          <span className="find__score">{t("quiz.score", { s: score })}</span>
        </div>
      </div>

      <WorldMap
        key={idx}
        countries={countries}
        selectedIso={answered ? target.iso2 : null}
        onSelect={guess}
        feedback={feedback}
        forceMarkers
        initialZoom={scope === "All" ? "World" : scope}
      />

      <div className="find__foot">
        {answered ? (
          <>
            <span className={`find__verdict ${correct ? "find__verdict--ok" : "find__verdict--no"}`}>
              {correct
                ? t("find.correct")
                : t("find.wrong", { x: pickedCountry?.name ?? t("find.sea"), t: target.name })}
            </span>
            <button type="button" className="btn btn--primary" onClick={next}>
              {idx + 1 === round.length ? t("quiz.results") : t("quiz.next")}
            </button>
          </>
        ) : (
          <span className="find__hint2">{t("find.hint", { x: target.name })}</span>
        )}
      </div>
    </div>
  );
}
