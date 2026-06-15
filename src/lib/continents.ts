import type { Continent } from "../types";

export interface ContinentMeta {
  name: Continent;
  emoji: string;
  /** Muted accent colour used for dots, headers and quiz chips. */
  color: string;
  /** Very light tint used for card hovers / selected backgrounds. */
  tint: string;
}

export const CONTINENTS: ContinentMeta[] = [
  { name: "Africa", emoji: "🦁", color: "#d98a2b", tint: "#fbf1e3" },
  { name: "Asia", emoji: "🏯", color: "#c0524e", tint: "#f9ebea" },
  { name: "Europe", emoji: "🏰", color: "#4f7cc4", tint: "#e9f0fa" },
  { name: "North America", emoji: "🗽", color: "#4f9d69", tint: "#e9f5ed" },
  { name: "South America", emoji: "🦜", color: "#b25aa6", tint: "#f6ebf4" },
  { name: "Oceania", emoji: "🐠", color: "#2f9e9a", tint: "#e6f4f3" },
];

export const CONTINENT_ORDER: Continent[] = CONTINENTS.map((c) => c.name);

const BY_NAME = new Map(CONTINENTS.map((c) => [c.name, c]));

export function continentMeta(name: Continent): ContinentMeta {
  return BY_NAME.get(name) ?? CONTINENTS[0];
}
