// CHANGED: new file — sort-by-size ranking game
import { useMemo, useState } from "react";
import type { Continent, Country } from "../types";
import { displayName, useLang, useT, type StringKey } from "../lib/i18n";
import { Flag } from "./Flag";
import { area, int } from "../lib/format";

type Scope = Continent | "All";
type Metric = "pop" | "area";

const GROUPS = 5;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const metricValue = (c: Country, m: Metric): number =>
  m === "pop" ? c.population : (c.landAreaKm2 ?? 0);

const formatVal = (c: Country, m: Metric): string =>
  m === "pop" ? int(c.population) : area(c.landAreaKm2);

interface SortGroup {
  items: Country[];
  metric: Metric;
}

function buildRound(pool: Country[]): SortGroup[] {
  const areaPool = pool.filter((c) => c.landAreaKm2 != null);
  const popPool = pool;

  return Array.from({ length: GROUPS }, () => {
    const metric: Metric = Math.random() < 0.5 ? "pop" : "area";
    const src = metric === "area" ? areaPool : popPool;
    const items = shuffle([...src]).slice(0, 4);
    return { items, metric };
  });
}

const cheerKey = (n: number, total: number): StringKey => {
  const pct = n / total;
  return pct === 1 ? "cheer.perfect" : pct >= 0.7 ? "cheer.great" : pct >= 0.4 ? "cheer.nice" : "cheer.keep";
};

export function SortGame({
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

  const [round] = useState<SortGroup[]>(() => buildRound(pool));
  const [groupIdx, setGroupIdx] = useState(0);
  const [clicked, setClicked] = useState<number[]>([]); // indices of items in click order
  const [phase, setPhase] = useState<"placing" | "checking" | "done">("placing");
  const [score, setScore] = useState(0);
  const [groupResults, setGroupResults] = useState<boolean[]>([]);

  if (!round.length) return null;

  const group = round[Math.min(groupIdx, round.length - 1)];
  const { items, metric } = group;

  const correctOrder = useMemo(
    () =>
      [...items]
        .map((c, i) => ({ c, i }))
        .sort((a, b) => metricValue(a.c, metric) - metricValue(b.c, metric))
        .map(({ i }) => i),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groupIdx]
  );

  const handleItemClick = (idx: number) => {
    if (phase !== "placing") return;
    const pos = clicked.indexOf(idx);
    if (pos >= 0) {
      setClicked(clicked.filter((_, i) => i !== pos));
    } else {
      setClicked([...clicked, idx]);
    }
  };

  const check = () => {
    const isCorrect = clicked.every((idx, pos) => idx === correctOrder[pos]);
    if (isCorrect) setScore((s) => s + 1);
    setGroupResults((r) => [...r, isCorrect]);
    setPhase("checking");
  };

  const next = () => {
    if (groupIdx + 1 >= round.length) {
      setPhase("done");
    } else {
      setGroupIdx((i) => i + 1);
      setClicked([]);
      setPhase("placing");
    }
  };

  const restart = () => {
    setGroupIdx(0);
    setClicked([]);
    setPhase("placing");
    setScore(0);
    setGroupResults([]);
  };

  if (phase === "done") {
    return (
      <div className="quiz quiz--result">
        <h2 className="quiz__title">{t(cheerKey(score, round.length))}</h2>
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

  const promptKey: StringKey = metric === "pop" ? "sort.prompt.pop" : "sort.prompt.area";

  return (
    <div className="quiz sort-game">
      <div className="sort-game__progress">
        {round.map((_, i) => {
          let cls = "sort-game__dot";
          if (i < groupIdx) cls += groupResults[i] ? " sort-game__dot--ok" : " sort-game__dot--bad";
          else if (i === groupIdx) cls += " sort-game__dot--cur";
          return <span key={i} className={cls} />;
        })}
      </div>

      <p className="sort-game__prompt">{t(promptKey)}</p>

      <div className="sort-items">
        {items.map((c, i) => {
          const userPos = clicked.indexOf(i); // 0-based or -1
          const badge = userPos >= 0 ? userPos + 1 : null;

          let cls = "sort-item";
          if (badge !== null) cls += " sort-item--numbered";

          if (phase === "checking") {
            const correctPos = correctOrder.indexOf(i);
            if (userPos === correctPos) cls = "sort-item sort-item--correct";
            else cls = "sort-item sort-item--wrong";
          }

          return (
            <button
              key={c.iso2}
              type="button"
              className={cls}
              onClick={() => handleItemClick(i)}
              disabled={phase === "checking"}
            >
              {badge !== null && <span className="sort-item__badge">{badge}</span>}
              <Flag iso2={c.iso2} className="sort-item__flag" />
              <span className="sort-item__name">{displayName(lang, c)}</span>
              {phase === "checking" && (
                <span className="sort-item__val">{formatVal(c, metric)}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="quiz__footer">
        {phase === "placing" && clicked.length === 4 && (
          <button type="button" className="btn btn--primary" onClick={check}>
            {t("sort.check")}
          </button>
        )}
        {phase === "checking" && (
          <button type="button" className="btn btn--primary" onClick={next}>
            {groupIdx + 1 === round.length ? t("quiz.results") : t("sort.next")}
          </button>
        )}
        {phase === "placing" && clicked.length < 4 && (
          <span className="quiz__hint">
            {lang === "uk"
              ? `Обрано: ${clicked.length} / 4`
              : `Selected: ${clicked.length} / 4`}
          </span>
        )}
      </div>
    </div>
  );
}
