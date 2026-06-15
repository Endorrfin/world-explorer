/**
 * Renders a country flag using the offline `flag-icons` SVG set (keyed by the
 * ISO-3166 alpha-2 code). Works on every OS, unlike emoji flags.
 */
export function Flag({
  iso2,
  className = "",
}: {
  iso2: string;
  className?: string;
}) {
  return (
    <span
      className={`fi fi-${iso2.toLowerCase()} flag ${className}`}
      role="img"
      aria-label={`${iso2} flag`}
    />
  );
}
