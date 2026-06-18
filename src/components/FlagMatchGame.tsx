import { useEffect, useMemo, useRef, useState } from "react";
import type { Continent, Country } from "../types";
import { displayName, useLang, useT, type StringKey } from "../lib/i18n";
import { Flag } from "./Flag";

type Scope = Continent | "All";

const GROUP = 4; // flags per screen
const TOTAL = 8; // total pairs per game (2 groups)

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

type ItemState = "idle" | "selected" | "correct" | "wrong";

export function FlagMatchGame({
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

  // Build all groups upfront
  const allGroups = useMemo<Country[][]>(() => {
    const chosen = shuffle(pool).slice(0, Math.min(TOTAL, pool.length));
    const groups: Country[][] = [];
    for (let i = 0; i < chosen.length; i += GROUP) {
      groups.push(chosen.slice(i, i + GROUP));
    }
    return groups;
  }, [pool]);

  const totalPairs = allGroups.reduce((s, g) => s + g.length, 0);

  const [groupIdx, setGroupIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  // Per-group state (reset each group)
  const group = allGroups[groupIdx] ?? [];
  const [flagOrder, setFlagOrder] = useState<Country[]>([]);
  const [nameOrder, setNameOrder] = useState<Country[]>([]);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongIso, setWrongIso] = useState<string | null>(null); // flag flashing red
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset per-group state when group changes
  useEffect(() => {
    setFlagOrder(shuffle(group));
    setNameOrder(shuffle(group));
    setSelectedIso(null);
    setMatched(new Set());
    setWrongIso(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIdx]);

  const allGroupMatched = group.length > 0 && matched.size === group.length;

  const handleFlagClick = (iso2: string) => {
    if (matched.has(iso2) || wrongIso) return;
    setSelectedIso((prev) => (prev === iso2 ? null : iso2));
  };

  const handleNameClick = (iso2: string) => {
    if (!selectedIso || matched.has(iso2) || wrongIso) return;
    if (selectedIso === iso2) {
      // Correct pair
      setMatched((prev) => new Set([...prev, iso2]));
      setScore((s) => s + 1);
      setSelectedIso(null);
    } else {
      // Wrong — flash red then reset
      setWrongIso(selectedIso);
      wrongTimer.current = setTimeout(() => {
        setWrongIso(null);
        setSelectedIso(null);
      }, 700);
    }
  };

  useEffect(() => () => { if (wrongTimer.current) clearTimeout(wrongTimer.current); }, []);

  const handleNext = () => {
    if (groupIdx + 1 >= allGroups.length) {
      setDone(true);
    } else {
      setGroupIdx((i) => i + 1);
    }
  };

  const handleRestart = () => {
    setGroupIdx(0);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((score / totalPairs) * 100);
    return (
      <div className="quiz quiz--result">
        <h2 className="quiz__title">{t(cheerKey(pct))}</h2>
        <p className="quiz__score-big">
          {score} / {totalPairs}
        </p>
        <div className="quiz__result-actions">
          <button type="button" className="btn btn--primary" onClick={handleRestart}>
            {t("quiz.playAgain")}
          </button>
          <button type="button" className="btn" onClick={onExit}>
            {t("quiz.changeGame")}
          </button>
        </div>
      </div>
    );
  }

  const flagState = (iso2: string): ItemState => {
    if (matched.has(iso2)) return "correct";
    if (wrongIso === iso2) return "wrong";
    if (selectedIso === iso2) return "selected";
    return "idle";
  };

  const nameState = (iso2: string): ItemState => {
    if (matched.has(iso2)) return "correct";
    return "idle";
  };

  const groupNum = groupIdx + 1;
  const groupTotal = allGroups.length;

  return (
    <div className="quiz quiz--match">
      {/* header bar */}
      <div className="quiz__bar">
        <span className="quiz__progress">
          {t("match.group", { i: groupNum, n: groupTotal })}
        </span>
        <span className="quiz__score">{t("quiz.score", { s: score })}</span>
      </div>

      <p className="quiz__prompt-text" style={{ textAlign: "center", marginBottom: 18 }}>
        {t("match.prompt")}
      </p>

      {/* match grid */}
      <div className="match-grid">
        {/* flags column */}
        <div className="match-col">
          {flagOrder.map((c) => {
            const st = flagState(c.iso2);
            return (
              <button
                key={c.iso2}
                type="button"
                className={`match-flag match-flag--${st}`}
                onClick={() => handleFlagClick(c.iso2)}
                disabled={st === "correct"}
                aria-label={`Flag of ${c.name}`}
              >
                <Flag iso2={c.iso2} className="match-flag__img" />
              </button>
            );
          })}
        </div>

        {/* names column */}
        <div className="match-col">
          {nameOrder.map((c) => {
            const st = nameState(c.iso2);
            return (
              <button
                key={c.iso2}
                type="button"
                className={`match-name match-name--${st}`}
                onClick={() => handleNameClick(c.iso2)}
                disabled={st === "correct" || !selectedIso}
              >
                {displayName(lang, c)}
              </button>
            );
          })}
        </div>
      </div>

      {/* footer */}
      <div className="quiz__footer">
        {allGroupMatched ? (
          <button type="button" className="btn btn--primary" onClick={handleNext}>
            {groupIdx + 1 >= allGroups.length ? t("quiz.results") : t("match.next")}
          </button>
        ) : (
          <span className="quiz__hint">
            {selectedIso ? t("match.hintName") : t("match.hintFlag")}
          </span>
        )}
      </div>
    </div>
  );
}
