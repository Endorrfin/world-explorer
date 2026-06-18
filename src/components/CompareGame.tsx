// CHANGED: new file — endless "Who's bigger?" compare game
import { useMemo, useRef, useState } from "react";
import type { Continent, Country } from "../types";
import { displayName, useT, useLang, type StringKey } from "../lib/i18n";
import { Flag } from "./Flag";
import { area, int } from "../lib/format";

type Scope = Continent | "All";
type Metric = "pop" | "area";
type Phase = "question" | "reveal" | "done";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const streakKey = (s: number): StringKey =>
  s >= 15 ? "cheer.perfect" : s >= 8 ? "cheer.great" : s >= 3 ? "cheer.nice" : "cheer.keep";

const metricValue = (c: Country, m: Metric): number =>
  m === "pop" ? c.population : (c.landAreaKm2 ?? 0);

const formatVal = (c: Country, m: Metric): string =>
  m === "pop" ? int(c.population) : area(c.landAreaKm2);

function pickPair(pool: Country[], exclude?: [string, string]): [Country, Country] {
  const cands = exclude ? pool.filter((c) => !exclude.includes(c.iso2)) : pool;
  const src = cands.length >= 4 ? cands : pool;
  const [a, b] = shuffle([...src]);
  return [a, b];
}

export function CompareGame({
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
    () =>
      (scope === "All" ? countries : countries.filter((c) => c.continent === scope)).filter(
        (c) => c.population > 0 && c.landAreaKm2 != null
      ),
    [countries, scope]
  );

  const [pair, setPair] = useState<[Country, Country]>(() => pickPair(pool));
  const [metric, setMetric] = useState<Metric>(() => (Math.random() < 0.5 ? "pop" : "area"));
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [pickedIso, setPickedIso] = useState<string | null>(null);
  const [correctIso, setCorrectIso] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const restart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const newPair = pickPair(pool);
    const newMetric: Metric = Math.random() < 0.5 ? "pop" : "area";
    setPair(newPair);
    setMetric(newMetric);
    setStreak(0);
    setPhase("question");
    setPickedIso(null);
    setCorrectIso(null);
  };

  const handle = (iso: string) => {
    if (phase !== "question") return;
    const [a, b] = pair;
    const winner = metricValue(a, metric) >= metricValue(b, metric) ? a.iso2 : b.iso2;
    setPickedIso(iso);
    setCorrectIso(winner);
    setPhase("reveal");

    if (iso === winner) {
      timerRef.current = setTimeout(() => {
        setStreak((s) => s + 1);
        const np = pickPair(pool, [a.iso2, b.iso2]);
        const nm: Metric = Math.random() < 0.5 ? "pop" : "area";
        setPair(np);
        setMetric(nm);
        setPickedIso(null);
        setCorrectIso(null);
        setPhase("question");
      }, 700);
    } else {
      timerRef.current = setTimeout(() => setPhase("done"), 1200);
    }
  };

  const promptKey: StringKey = metric === "pop" ? "compare.prompt.pop" : "compare.prompt.area";

  if (phase === "done") {
    return (
      <div className="quiz quiz--result">
        <h2 className="quiz__title">{t(streakKey(streak))}</h2>
        <p className="compare__streak-label">
          {t("compare.streak")}: <strong>{streak}</strong>
        </p>
        <div className="quiz__result-actions">
          <button type="button" className="btn btn--primary" onClick={restart}>
            {t("quiz.playAgain")}
          </button>
          <button type="button" className="btn" onClick={onExit}>
            {t("quiz.changeGame")}
          </button>
        </div>

        {pickedIso && correctIso && pickedIso !== correctIso && (
          <div className="compare__reveal">
            <p className="compare__reveal-label">{t("compare.correct")}</p>
            <div className="compare__grid compare__grid--reveal">
              {pair.map((c) => {
                const isCorrect = c.iso2 === correctIso;
                const isPicked = c.iso2 === pickedIso;
                return (
                  <div
                    key={c.iso2}
                    className={`compare__card${isCorrect ? " compare__card--correct" : isPicked ? " compare__card--wrong" : ""}`}
                  >
                    <Flag iso2={c.iso2} className="compare__flag" />
                    <span className="compare__name">{displayName(lang, c)}</span>
                    <span className="compare__val">{formatVal(c, metric)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="quiz compare">
      <div className="compare__bar">
        <span className="compare__streak">
          {t("compare.streak")}: <strong>{streak}</strong>
        </span>
      </div>
      <p className="compare__prompt">{t(promptKey)}</p>
      <div className="compare__grid">
        {pair.map((c) => {
          let cls = "compare__card";
          if (phase === "reveal") {
            if (c.iso2 === correctIso) cls += " compare__card--correct";
            else if (c.iso2 === pickedIso) cls += " compare__card--wrong";
          }
          return (
            <button key={c.iso2} type="button" className={cls} onClick={() => handle(c.iso2)}>
              <Flag iso2={c.iso2} className="compare__flag" />
              <span className="compare__name">{displayName(lang, c)}</span>
              {phase === "reveal" && (
                <span className="compare__val">{formatVal(c, metric)}</span>
              )}
            </button>
          );
        })}
      </div>
      <button type="button" className="btn compare__exit" onClick={onExit}>
        {t("quiz.changeGame")}
      </button>
    </div>
  );
}
