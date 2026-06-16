// lib_crimea.mjs — reassign the Crimean peninsula from Russia to Ukraine.
//
// Natural Earth's `admin_0_countries` layer (the source behind world-atlas) has,
// since v4.0, drawn Crimea & Sevastopol as de-facto Russian territory. That is
// NOT their international status: UN General Assembly Resolution 68/262 (27 Mar
// 2014, "Territorial integrity of Ukraine") affirms Ukraine's internationally
// recognized borders and calls on all states not to recognize any altered status
// of Crimea or Sevastopol. This helper restores that: it moves the Crimea
// polygon(s) out of the Russia feature and into the Ukraine feature, in GeoJSON
// space, before any projection happens.
//
// Detection is by interior anchor points: Crimea connects to mainland Russia only
// across the Kerch Strait (water), so it is always a SEPARATE polygon inside the
// Russia MultiPolygon. The polygon that covers a Crimea anchor is Crimea — the
// huge Russian mainland polygon (which also spans Taman) never covers these.
import { geoContains } from "d3-geo";

const RUS_ID = 643; // ccn3 / Natural Earth numeric id
const UKR_ID = 804;

// Points that sit firmly on the Crimean peninsula (and on no other Russia polygon).
const CRIMEA_ANCHORS = [
  [34.1, 44.95], // Simferopol  — central Crimea
  [33.36, 45.19], // Yevpatoria — west
  [36.47, 45.36], // Kerch       — eastern tip
];

const polygonsOf = (g) =>
  g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];

const isCrimea = (poly) =>
  CRIMEA_ANCHORS.some((pt) => geoContains({ type: "Polygon", coordinates: poly }, pt));

// Mutates `fc` in place. Returns the number of polygons moved (expected: 1).
export function reassignCrimeaToUkraine(fc) {
  const rus = fc.features.find((f) => Number(f.id) === RUS_ID);
  const ukr = fc.features.find((f) => Number(f.id) === UKR_ID);
  if (!rus || !ukr) return 0;

  const keep = [];
  const crimea = [];
  for (const poly of polygonsOf(rus.geometry)) (isCrimea(poly) ? crimea : keep).push(poly);
  if (!crimea.length) return 0;

  rus.geometry = { type: "MultiPolygon", coordinates: keep };
  ukr.geometry = { type: "MultiPolygon", coordinates: polygonsOf(ukr.geometry).concat(crimea) };
  return crimea.length;
}
