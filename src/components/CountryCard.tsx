import type { Country } from "../types";
import { continentMeta } from "../lib/continents";
import { displayCapital, displayName, useLang } from "../lib/i18n";
import { Flag } from "./Flag";
import { CountryShape } from "./CountryShape";

export function CountryCard({
  country,
  selected,
  onSelect,
}: {
  country: Country;
  selected: boolean;
  onSelect: (c: Country) => void;
}) {
  const meta = continentMeta(country.continent);
  const { lang } = useLang();
  return (
    <button
      type="button"
      className={`card${selected ? " card--selected" : ""}`}
      onClick={() => onSelect(country)}
      aria-pressed={selected}
    >
      <Flag iso2={country.iso2} className="card__flag" />
      <span className="card__text">
        <span className="card__name">{displayName(lang, country)}</span>
        <span className="card__capital">{displayCapital(lang, country)}</span>
      </span>
      <CountryShape
        iso2={country.iso2}
        fill={meta.tint}
        stroke={meta.color}
        className="card__shape"
      />
    </button>
  );
}
