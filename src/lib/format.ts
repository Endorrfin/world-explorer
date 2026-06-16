/** Formatting helpers. All tolerate null. Locale is set by the app (en-US / uk-UA). */

const DASH = "—";
let LOCALE = "en-US";
export function setLocale(l: string) {
  LOCALE = l;
}

export function int(n: number | null | undefined): string {
  if (n == null) return DASH;
  return n.toLocaleString(LOCALE);
}

/** Compact USD: $1.46T, $3.05T, $812B, $24.5M. */
export function usd(n: number | null | undefined): string {
  if (n == null) return DASH;
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString(LOCALE)}`;
}

/** Plain USD with separators: $45,934. */
export function usdPlain(n: number | null | undefined): string {
  if (n == null) return DASH;
  return `$${n.toLocaleString(LOCALE)}`;
}

/** Fraction (0..1) -> localized percentage string. */
export function percent(frac: number | null | undefined, digits = 2): string {
  if (frac == null) return DASH;
  return `${(frac * 100).toLocaleString(LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

export function area(n: number | null | undefined): string {
  if (n == null) return DASH;
  return `${n.toLocaleString(LOCALE)} km²`;
}

export function decimal(n: number | null | undefined, digits = 1): string {
  if (n == null) return DASH;
  return n.toLocaleString(LOCALE, { minimumFractionDigits: 0, maximumFractionDigits: digits });
}

export function plain(n: number | null | undefined): string {
  return n == null ? DASH : String(n);
}

/** GPI 2024 number, localized (lower = safer). */
export function peaceValue(gpi: number | null | undefined): string {
  return gpi == null ? DASH : gpi.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** GPI band key for translation, or null. */
export function peaceBandKey(gpi: number | null | undefined): "very" | "peaceful" | "medium" | "less" | null {
  if (gpi == null) return null;
  if (gpi < 1.5) return "very";
  if (gpi < 2.0) return "peaceful";
  if (gpi < 2.5) return "medium";
  return "less";
}
