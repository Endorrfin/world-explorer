export interface Country {
  iso2: string;
  iso3: string;
  name: string;
  flag: string; // emoji fallback
  continent: Continent;
  subregion: string;
  capital: string;
  callingCode: number | null;
  // people
  population: number;
  populationWorldShare: number | null; // fraction (0..1)
  density: number | null;
  fertilityRate: number | null;
  medianAge: number | null;
  urbanPop: number | null; // fraction
  birthsPerDay: number | null;
  // economy
  gdpNominal: number | null; // USD
  gdpPerCapita: number | null; // USD
  gdpWorldShare: number | null; // fraction
  // land
  landAreaKm2: number | null;
  totalAreaKm2: number | null;
  areaWorldShare: number | null; // fraction
  // extras
  peaceIndex: number | null; // GPI 2024, lower = safer
  // content
  knownFor: string[];
}

export type Continent =
  | "Africa"
  | "Asia"
  | "Europe"
  | "North America"
  | "South America"
  | "Oceania";

export type Tab = "explore" | "quiz";
