import type { Country } from "../types";
import { continentMeta } from "../lib/continents";
import { continentLabel, displayCapital, displayName, useLang, useT } from "../lib/i18n";
import { Flag } from "./Flag";
import { CountryShape } from "./CountryShape";
import {
  area,
  decimal,
  int,
  peaceBandKey,
  peaceValue,
  percent,
  plain,
  usd,
  usdPlain,
} from "../lib/format";

const PEACE_KEY = {
  very: "peace.very",
  peaceful: "peace.peaceful",
  medium: "peace.medium",
  less: "peace.less",
} as const;

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
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
  neighbors = [],
  onSelectNeighbor,
}: {
  country: Country | null;
  onClose: () => void;
  onLocate?: () => void;
  neighbors?: Country[];
  onSelectNeighbor?: (iso: string) => void;
}) {
  const t = useT();
  const { lang } = useLang();

  if (!country) {
    return (
      <aside className="detail detail--empty">
        <div className="detail__placeholder">
          <span className="detail__placeholder-icon" aria-hidden>
            🧭
          </span>
          <p>{t("detail.placeholder")}</p>
        </div>
      </aside>
    );
  }

  const meta = continentMeta(country.continent);
  const pk = peaceBandKey(country.peaceIndex);
  const peaceStr = pk ? `${peaceValue(country.peaceIndex)} · ${t(PEACE_KEY[pk])}` : "—";

  return (
    <aside className="detail">
      <button type="button" className="detail__close" onClick={onClose} aria-label="Close">
        ✕
      </button>

      <header className="detail__head" style={{ background: meta.tint }}>
        <Flag iso2={country.iso2} className="detail__flag" />
        <div className="detail__titles">
          <h2 className="detail__name">{displayName(lang, country)}</h2>
          <p className="detail__sub">
            <span className="detail__continent-dot" style={{ background: meta.color }} />
            {continentLabel(lang, country.continent)} · {country.subregion}
          </p>
          <p className="detail__capital">
            <span aria-hidden>🏛️</span> {t("detail.capital")}: <b>{displayCapital(lang, country)}</b>
          </p>
          {onLocate && (
            <button type="button" className="detail__locate" onClick={onLocate}>
              {t("detail.locate")}
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
          <h3 className="detail__section-title">{t("detail.knownFor")}</h3>
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
        <h3 className="detail__section-title">{t("detail.people")}</h3>
        <div className="stats">
          <Stat label={t("stat.population")} value={int(country.population)} />
          <Stat
            label={t("stat.worldShare")}
            value={percent(country.populationWorldShare)}
            hint={t("stat.ofPeople")}
          />
          <Stat
            label={t("stat.density")}
            value={country.density != null ? `${int(country.density)} /km²` : "—"}
          />
          <Stat label={t("stat.medianAge")} value={decimal(country.medianAge)} />
          <Stat
            label={t("stat.fertility")}
            value={decimal(country.fertilityRate)}
            hint={t("stat.fertilityHint")}
          />
          <Stat label={t("stat.urban")} value={percent(country.urbanPop, 0)} hint={t("stat.urbanHint")} />
          <Stat label={t("stat.birthsPerDay")} value={int(country.birthsPerDay)} />
        </div>
      </section>

      <section className="detail__section">
        <h3 className="detail__section-title">{t("detail.economy")}</h3>
        <div className="stats">
          <Stat label={t("stat.gdpTotal")} value={usd(country.gdpNominal)} hint="2023" />
          <Stat
            label={t("stat.income")}
            value={usdPlain(country.gdpPerCapita)}
            hint={t("stat.incomeHint")}
          />
          <Stat label={t("stat.gdpShare")} value={percent(country.gdpWorldShare)} />
        </div>
      </section>

      <section className="detail__section">
        <h3 className="detail__section-title">{t("detail.land")}</h3>
        <div className="stats">
          <Stat label={t("stat.landArea")} value={area(country.landAreaKm2)} />
          <Stat
            label={t("stat.territory")}
            value={area(country.totalAreaKm2)}
            hint={t("stat.territoryHint")}
          />
          <Stat label={t("stat.landShare")} value={percent(country.areaWorldShare)} />
        </div>
      </section>

      <section className="detail__section">
        <h3 className="detail__section-title">
          {t("detail.neighbours")}
          {neighbors.length > 0 ? ` (${neighbors.length})` : ""}
        </h3>
        {neighbors.length > 0 ? (
          <div className="neighbors">
            {neighbors.map((n) => (
              <button
                key={n.iso2}
                type="button"
                className="neighbor"
                onClick={() => onSelectNeighbor?.(n.iso2)}
              >
                <Flag iso2={n.iso2} className="neighbor__flag" />
                <span className="neighbor__name">{displayName(lang, n)}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="detail__none">{t("detail.island")}</p>
        )}
      </section>

      <section className="detail__section">
        <h3 className="detail__section-title">{t("detail.goodToKnow")}</h3>
        <div className="stats">
          <Stat label={t("stat.iso")} value={country.iso2} />
          <Stat
            label={t("stat.phone")}
            value={country.callingCode != null ? `+${plain(country.callingCode)}` : "—"}
          />
          <Stat label={t("stat.peace")} value={peaceStr} hint="2024" />
        </div>
      </section>
    </aside>
  );
}
