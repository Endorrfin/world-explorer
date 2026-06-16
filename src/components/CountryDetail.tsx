import type { Country } from "../types";
import { continentMeta } from "../lib/continents";
import { Flag } from "./Flag";
import { CountryShape } from "./CountryShape";
import {
  area,
  decimal,
  int,
  peaceLabel,
  percent,
  plain,
  usd,
  usdPlain,
} from "../lib/format";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="stat">
      <span className="stat__label">
        {label}
        {hint ? <span className="stat__hint"> {hint}</span> : null}
      </span>
      <span className="stat__value">{value}</span>
    </div>
  );
}

export function CountryDetail({
  country,
  onClose,
  onLocate,
}: {
  country: Country | null;
  onClose: () => void;
  onLocate?: () => void;
}) {
  if (!country) {
    return (
      <aside className="detail detail--empty">
        <div className="detail__placeholder">
          <span className="detail__placeholder-icon" aria-hidden>
            🧭
          </span>
          <p>Pick a country to see its capital, flag, facts and figures.</p>
        </div>
      </aside>
    );
  }

  const meta = continentMeta(country.continent);

  return (
    <aside className="detail">
      <button
        type="button"
        className="detail__close"
        onClick={onClose}
        aria-label="Close details"
      >
        ✕
      </button>

      <header className="detail__head" style={{ background: meta.tint }}>
        <Flag iso2={country.iso2} className="detail__flag" />
        <div className="detail__titles">
          <h2 className="detail__name">{country.name}</h2>
          <p className="detail__sub">
            <span
              className="detail__continent-dot"
              style={{ background: meta.color }}
            />
            {country.continent} · {country.subregion}
          </p>
          <p className="detail__capital">
            <span aria-hidden>🏛️</span> Capital: <b>{country.capital}</b>
          </p>
          {onLocate && (
            <button type="button" className="detail__locate" onClick={onLocate}>
              🔍 Locate on map
            </button>
          )}
        </div>
        <CountryShape
          iso2={country.iso2}
          fill="none"
          stroke={meta.color}
          strokeWidth={1.4}
          className="detail__shape"
        />
      </header>

      {country.knownFor.length > 0 && (
        <section className="detail__section">
          <h3 className="detail__section-title">⭐ Known for</h3>
          <ul className="known">
            {country.knownFor.map((f, i) => (
              <li key={i} className="known__item">
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="detail__section">
        <h3 className="detail__section-title">👫 People</h3>
        <div className="stats">
          <Stat label="Population" value={int(country.population)} />
          <Stat
            label="World share"
            value={percent(country.populationWorldShare)}
            hint="of people"
          />
          <Stat
            label="Density"
            value={
              country.density != null ? `${int(country.density)} /km²` : "—"
            }
          />
          <Stat label="Median age" value={decimal(country.medianAge)} />
          <Stat label="Births per family" value={decimal(country.fertilityRate)} hint="(fertility)" />
          <Stat label="City dwellers" value={percent(country.urbanPop, 0)} hint="(urban)" />
          <Stat label="Births per day" value={int(country.birthsPerDay)} />
        </div>
      </section>

      <section className="detail__section">
        <h3 className="detail__section-title">💰 Economy</h3>
        <div className="stats">
          <Stat label="GDP (total)" value={usd(country.gdpNominal)} hint="2023" />
          <Stat
            label="Per-person income"
            value={usdPlain(country.gdpPerCapita)}
            hint="(GDP per capita)"
          />
          <Stat label="Share of world GDP" value={percent(country.gdpWorldShare)} />
        </div>
      </section>

      <section className="detail__section">
        <h3 className="detail__section-title">🗺️ Land</h3>
        <div className="stats">
          <Stat label="Land area" value={area(country.landAreaKm2)} />
          <Stat
            label="Territory (total)"
            value={area(country.totalAreaKm2)}
            hint="land + water"
          />
          <Stat label="Share of world land" value={percent(country.areaWorldShare)} />
        </div>
      </section>

      <section className="detail__section">
        <h3 className="detail__section-title">ℹ️ Good to know</h3>
        <div className="stats">
          <Stat label="ISO code" value={country.iso2} />
          <Stat
            label="Phone code"
            value={country.callingCode != null ? `+${plain(country.callingCode)}` : "—"}
          />
          <Stat label="Peace index" value={peaceLabel(country.peaceIndex)} hint="2024" />
        </div>
      </section>
    </aside>
  );
}
