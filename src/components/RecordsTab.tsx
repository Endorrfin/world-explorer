import type { Country } from "../types";
import { Flag } from "./Flag";
import { displayName, useLang } from "../lib/i18n";
import { area, decimal, int, usdPlain } from "../lib/format";

// CHANGED: new tab — world record cards, computed + static geographic records

// ── types ──────────────────────────────────────────────────────────────────
interface RecordCard {
  emoji: string;
  titleEn: string;
  titleUk: string;
  country: Country;
  valueEn: string;
  valueUk: string;
}

interface StaticDef {
  emoji: string;
  titleEn: string;
  titleUk: string;
  iso: string;
  valueEn: string;
  valueUk: string;
}

// ── static geographic records (hardcoded facts) ─────────────────────────────
const STATIC_DEFS: StaticDef[] = [
  {
    emoji: "🏔️",
    titleEn: "Highest mountain",
    titleUk: "Найвища гора",
    iso: "NP",
    valueEn: "Mount Everest — 8,848 m",
    valueUk: "Гора Еверест — 8 848 м",
  },
  {
    emoji: "💧",
    titleEn: "Tallest waterfall",
    titleUk: "Найвищий водоспад",
    iso: "VE",
    valueEn: "Angel Falls — 979 m",
    valueUk: "Водоспад Анхель — 979 м",
  },
  {
    emoji: "🌊",
    titleEn: "Longest river",
    titleUk: "Найдовша ріка",
    iso: "EG",
    valueEn: "Nile — 6,650 km",
    valueUk: "Ніл — 6 650 км",
  },
  {
    emoji: "🌀",
    titleEn: "Deepest river",
    titleUk: "Найглибша ріка",
    iso: "CD",
    valueEn: "Congo River — 220 m deep",
    valueUk: "Ріка Конго — 220 м глибини",
  },
  {
    emoji: "🏞️",
    titleEn: "Most lakes",
    titleUk: "Найбільше озер",
    iso: "CA",
    valueEn: "Over 3 million lakes",
    valueUk: "Понад 3 мільйони озер",
  },
  {
    emoji: "🧊",
    titleEn: "Largest freshwater reserves",
    titleUk: "Найбільше запасів прісної води",
    iso: "BR",
    valueEn: "~12 % of world's freshwater",
    valueUk: "~12 % прісної води планети",
  },
  {
    emoji: "🛢️",
    titleEn: "Largest oil reserves",
    titleUk: "Найбільші запаси нафти",
    iso: "VE",
    valueEn: "303 billion barrels",
    valueUk: "303 млрд барелів",
  },
  {
    emoji: "🌾",
    titleEn: "Most black soil (chernozem)",
    titleUk: "Найбільше чорнозему",
    iso: "UA",
    valueEn: "25 % of world's chernozem",
    valueUk: "25 % чорнозему планети",
  },
  {
    emoji: "⚡",
    titleEn: "Highest nuclear energy share",
    titleUk: "Найбільша частка ядерної енергетики",
    iso: "FR",
    valueEn: "~70 % electricity from nuclear",
    valueUk: "~70 % електрики з ядерної енергії",
  },
  {
    emoji: "✈️",
    titleEn: "Most immigrants",
    titleUk: "Найбажаніша для переселення",
    iso: "US",
    valueEn: "50 million immigrants",
    valueUk: "50 мільйонів іммігрантів",
  },
  {
    emoji: "🏛️",
    titleEn: "Oldest republic",
    titleUk: "Найстаріша республіка",
    iso: "SM",
    valueEn: "Founded 301 AD",
    valueUk: "Заснована 301 р. н. е.",
  },
  {
    emoji: "🌍",
    titleEn: "Youngest country",
    titleUk: "Наймолодша країна",
    iso: "SS",
    valueEn: "Independence: July 2011",
    valueUk: "Незалежність: липень 2011 р.",
  },
  {
    emoji: "🗣️",
    titleEn: "Most official languages",
    titleUk: "Найбільше офіційних мов",
    iso: "ZA",
    valueEn: "12 official languages", // CHANGED: 11 → 12 (sign language added 2023)
    valueUk: "12 офіційних мов", // CHANGED: 11 → 12
  },
  {
    emoji: "🌋",
    titleEn: "Most active volcanoes",
    titleUk: "Найбільше активних вулканів",
    iso: "ID",
    valueEn: "127 active volcanoes",
    valueUk: "127 активних вулканів",
  },
  {
    emoji: "🏖️",
    titleEn: "Longest coastline",
    titleUk: "Найдовша берегова лінія",
    iso: "CA",
    valueEn: "202,080 km of coastline",
    valueUk: "202 080 км берегової лінії",
  },
  {
    emoji: "🏛️",
    titleEn: "Most UNESCO World Heritage Sites",
    titleUk: "Найбільше об'єктів ЮНЕСКО",
    iso: "IT",
    valueEn: "61 UNESCO sites", // CHANGED: 58 → 61 (current total, most of any country)
    valueUk: "61 об'єкт ЮНЕСКО", // CHANGED: 58 → 61
  },
  {
    emoji: "🧳",
    titleEn: "Most visited by tourists",
    titleUk: "Найпопулярніша у туристів",
    iso: "FR",
    valueEn: "100 million visitors/year",
    valueUk: "100 мільйонів туристів на рік",
  },
  {
    emoji: "🐾",
    titleEn: "Most animal & plant species",
    titleUk: "Найбільше видів тварин і рослин",
    iso: "BR",
    valueEn: "World's most biodiverse country",
    valueUk: "Найбіорізноманітніша країна планети",
  },
  {
    emoji: "💬",
    titleEn: "Most languages spoken",
    titleUk: "Найбільше мов",
    iso: "PG",
    valueEn: "Over 800 languages",
    valueUk: "Понад 800 мов",
  },
  {
    emoji: "🌊",
    titleEn: "Borders the most seas",
    titleUk: "Омивається найбільшою кількістю морів",
    iso: "RU",
    valueEn: "12 seas and oceans",
    valueUk: "12 морів та океанів",
  },
];

// ── helpers ─────────────────────────────────────────────────────────────────
function pickMax(countries: Country[], key: (x: Country) => number | null): Country | null {
  let best: Country | null = null;
  let bestV = -Infinity;
  for (const x of countries) {
    const v = key(x);
    if (v != null && v > bestV) { bestV = v; best = x; }
  }
  return best;
}

function pickMin(countries: Country[], key: (x: Country) => number | null): Country | null {
  let best: Country | null = null;
  let bestV = Infinity;
  for (const x of countries) {
    const v = key(x);
    if (v != null && v < bestV) { bestV = v; best = x; }
  }
  return best;
}

// ── computed records ─────────────────────────────────────────────────────────
function buildComputed(countries: Country[]): RecordCard[] {
  const cards: RecordCard[] = [];

  const add = (
    emoji: string, titleEn: string, titleUk: string,
    country: Country | null,
    valueEn: string, valueUk?: string
  ) => {
    if (!country) return;
    cards.push({ emoji, titleEn, titleUk, country, valueEn, valueUk: valueUk ?? valueEn });
  };

  const withArea = countries.filter(c => c.landAreaKm2 != null);
  add("🌍", "Largest country", "Найбільша країна",
    pickMax(withArea, c => c.landAreaKm2),
    `${area(pickMax(withArea, c => c.landAreaKm2)?.landAreaKm2)}`);

  const withAreaPos = countries.filter(c => c.landAreaKm2 != null && c.landAreaKm2 > 0);
  add("🔬", "Smallest country", "Найменша країна",
    pickMin(withAreaPos, c => c.landAreaKm2),
    `${area(pickMin(withAreaPos, c => c.landAreaKm2)?.landAreaKm2)}`);

  const mostPop = pickMax(countries, c => c.population);
  add("👥", "Most populous", "Найбільше населення", mostPop,
    `${int(mostPop?.population)} people`, `${int(mostPop?.population)} осіб`);

  const leastPop = pickMin(countries.filter(c => c.population > 0), c => c.population);
  add("🏝️", "Least populous", "Найменше населення", leastPop,
    `${int(leastPop?.population)} people`, `${int(leastPop?.population)} осіб`);

  const richest = pickMax(countries.filter(c => c.gdpPerCapita != null), c => c.gdpPerCapita);
  add("💰", "Highest income per person", "Найвищий дохід на особу", richest,
    `${usdPlain(richest?.gdpPerCapita)} / person`, `${usdPlain(richest?.gdpPerCapita)} / особу`);

  const poorest = pickMin(countries.filter(c => c.gdpPerCapita != null && c.gdpPerCapita > 0), c => c.gdpPerCapita);
  add("📉", "Lowest income per person", "Найнижчий дохід на особу", poorest,
    `${usdPlain(poorest?.gdpPerCapita)} / person`, `${usdPlain(poorest?.gdpPerCapita)} / особу`);

  const peaceful = pickMin(countries.filter(c => c.peaceIndex != null), c => c.peaceIndex);
  add("☮️", "Most peaceful", "Наймирніша країна", peaceful,
    `Peace Index: ${decimal(peaceful?.peaceIndex, 3)}`,
    `Індекс миру: ${decimal(peaceful?.peaceIndex, 3)}`);

  const conflict = pickMax(countries.filter(c => c.peaceIndex != null), c => c.peaceIndex);
  add("⚔️", "Least peaceful", "Найнеспокійніша країна", conflict,
    `Peace Index: ${decimal(conflict?.peaceIndex, 3)}`,
    `Індекс миру: ${decimal(conflict?.peaceIndex, 3)}`);

  const oldest = pickMax(countries.filter(c => c.medianAge != null), c => c.medianAge);
  add("👴", "Oldest population", "Найстарше населення", oldest,
    `Median age: ${decimal(oldest?.medianAge)} yrs`, `Середній вік: ${decimal(oldest?.medianAge)} р.`);

  const youngest = pickMin(countries.filter(c => c.medianAge != null), c => c.medianAge);
  add("👶", "Youngest population", "Наймолодше населення", youngest,
    `Median age: ${decimal(youngest?.medianAge)} yrs`, `Середній вік: ${decimal(youngest?.medianAge)} р.`);

  const fertility = pickMax(countries.filter(c => c.fertilityRate != null), c => c.fertilityRate);
  add("🤱", "Highest birth rate", "Найвища народжуваність", fertility,
    `${decimal(fertility?.fertilityRate)} children per family`, `${decimal(fertility?.fertilityRate)} дитини на сім'ю`);

  const densest = pickMax(countries.filter(c => c.density != null), c => c.density);
  add("🏙️", "Most densely populated", "Найгустіше населення", densest,
    `${int(densest?.density)} people/km²`, `${int(densest?.density)} осіб/км²`);

  // Most neighbors (prefer non-Russia winner when tied)
  const withNeighbors = [...countries].sort((a, b) => {
    const diff = b.neighbors.length - a.neighbors.length;
    if (diff !== 0) return diff;
    // on tie, put RU last so a non-RU winner surfaces
    if (a.iso2 === "RU") return 1;
    if (b.iso2 === "RU") return -1;
    return 0;
  });
  const mostNeighbors = withNeighbors[0];
  if (mostNeighbors && mostNeighbors.neighbors.length > 0) {
    add("🤝", "Most land neighbors", "Найбільше сусідів", mostNeighbors,
      `${mostNeighbors.neighbors.length} neighboring countries`,
      `${mostNeighbors.neighbors.length} сусідніх країн`);
  }

  const births = pickMax(countries.filter(c => c.birthsPerDay != null), c => c.birthsPerDay);
  add("🍼", "Most births per day", "Найбільше народжень на день", births,
    `${int(births?.birthsPerDay)} births/day`, `${int(births?.birthsPerDay)} народжень/день`);

  return cards;
}

// ── main component ───────────────────────────────────────────────────────────
export function RecordsTab({ countries }: { countries: Country[] }) {
  const { lang } = useLang();

  const byIso = new Map(countries.map(c => [c.iso2, c]));

  const computed = buildComputed(countries);

  const staticCards: RecordCard[] = STATIC_DEFS.flatMap(d => {
    const country = byIso.get(d.iso);
    if (!country) return [];
    return [{ emoji: d.emoji, titleEn: d.titleEn, titleUk: d.titleUk, country, valueEn: d.valueEn, valueUk: d.valueUk }];
  });

  // Merge: computed first, static next; Russia (RU) always goes last
  const all = [...computed, ...staticCards].sort((a, b) => {
    const aRu = a.country.iso2 === "RU" ? 1 : 0;
    const bRu = b.country.iso2 === "RU" ? 1 : 0;
    return aRu - bRu;
  });

  return (
    <div className="records">
      <h1 className="records__title">
        {lang === "uk" ? "🏆 Рекорди світу" : "🏆 World Records"}
      </h1>
      <p className="records__lead">
        {lang === "uk"
          ? "Найбільше, найменше, найбагатше, наймирніше — 195 країн у цифрах."
          : "Biggest, smallest, richest, most peaceful — 195 countries by the numbers."}
      </p>
      <div className="records__grid">
        {all.map((r, i) => (
          <div key={i} className="record-card">
            <div className="record-card__emoji" aria-hidden>{r.emoji}</div>
            <div className="record-card__title">
              {lang === "uk" ? r.titleUk : r.titleEn}
            </div>
            <div className="record-card__country">
              <Flag iso2={r.country.iso2} className="record-card__flag" />
              <span className="record-card__name">{displayName(lang, r.country)}</span>
            </div>
            <div className="record-card__value">
              {lang === "uk" ? r.valueUk : r.valueEn}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
