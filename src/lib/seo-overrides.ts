// Optional per-path overrides for `generateMetadata`. Use the path with locale, e.g. `/en/week/2042/27`.
// Titles should be the segment before the site suffix only — `layout.tsx` applies `%s | WhatWeek.ca`.
// Example: "/en/week/2042/27": { title: "Week 27 of 2042 in Canada", description: "…" }

export type SeoOverride = {
  title?: string;
  description?: string;
};

export const seoOverrides: Record<string, SeoOverride> = {
  "/en/current-week-number-canada": {
    title: "Current Week Number in Canada Today",
    description: "Find the current week number in Canada right now — ISO 8601 and Canada Sun–Sat systems, with exact date ranges and holidays.",
  },
  "/fr/current-week-number-canada": {
    title: "Numéro de semaine actuel au Canada aujourd'hui",
    description: "Consultez le numéro de semaine actuel au Canada avec les systèmes Canada et ISO et les dates exactes.",
  },
  "/en/what-week-is-it": {
    title: "What Week Is It? Live Answer for Canada",
    description:
      "What week is it? Live answer for Canada — current week number, this week's start and end dates, updated in real time. Free, bilingual.",
  },
  "/fr/what-week-is-it": {
    title: "Quelle semaine sommes-nous? Réponse en direct",
    description:
      "Quelle semaine sommes-nous? Réponse en direct pour le Canada — semaine actuelle, dates de début et de fin, mise à jour en temps réel.",
  },
  "/en/what-week-of-the-year-is-it": {
    title: "What Week of the Year Is It? Live for Canada",
    description:
      "What week of the year is it? Current Canada week number, weeks elapsed, weeks remaining — live, ISO and Canada Sun–Sat systems, bilingual.",
  },
  "/fr/what-week-of-the-year-is-it": {
    title: "Quelle semaine de l'année sommes-nous? | WhatWeek.ca",
    description:
      "Quelle semaine de l'année sommes-nous? Numéro de semaine en cours au Canada, semaines parcourues, semaines restantes — mis à jour en direct.",
  },
  "/en/weeks-in-a-year": {
    title: "How many weeks are in a year?",
    description: "See how many weeks are in a year and navigate to Canada year calendars with week numbers.",
  },
  "/fr/weeks-in-a-year": {
    title: "Combien de semaines dans une année?",
    description: "Découvrez combien de semaines compte une année et accédez aux calendriers canadiens par année.",
  },
};

/**
 * Helper to get the SEO override for a specific path.
 * The path should include the locale, e.g., "en/week/2026/1" or "/en/week/2026/1"
 */
export function getSeoOverride(path: string): SeoOverride | undefined {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return seoOverrides[normalizedPath];
}
