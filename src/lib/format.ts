/** Formatting helpers for the detail panel. All tolerate null. */

const DASH = "—";

export function int(n: number | null | undefined): string {
  if (n == null) return DASH;
  return n.toLocaleString("en-US");
}

/** Compact USD: $1.46T, $3.05T, $812B, $24.5M. */
export function usd(n: number | null | undefined): string {
  if (n == null) return DASH;
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString("en-US")}`;
}

/** Plain USD with separators: $45,934. */
export function usdPlain(n: number | null | undefined): string {
  if (n == null) return DASH;
  return `$${n.toLocaleString("en-US")}`;
}

/** Fraction (0..1) -> percentage string. percent(0.1778) === "17.78%". */
export function percent(frac: number | null | undefined, digits = 2): string {
  if (frac == null) return DASH;
  return `${(frac * 100).toFixed(digits)}%`;
}

/** Area in km² with separators and unit. */
export function area(n: number | null | undefined): string {
  if (n == null) return DASH;
  return `${n.toLocaleString("en-US")} km²`;
}

export function decimal(n: number | null | undefined, digits = 1): string {
  if (n == null) return DASH;
  return n.toFixed(digits);
}

export function plain(n: number | null | undefined): string {
  return n == null ? DASH : String(n);
}

/** GPI 2024 -> kid-friendly label. Lower index = safer. */
export function peaceLabel(gpi: number | null | undefined): string {
  if (gpi == null) return DASH;
  let band = "";
  if (gpi < 1.5) band = "very peaceful";
  else if (gpi < 2.0) band = "peaceful";
  else if (gpi < 2.5) band = "medium";
  else band = "less peaceful";
  return `${gpi.toFixed(2)} · ${band}`;
}
