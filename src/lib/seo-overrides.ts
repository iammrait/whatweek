// Optional per-path overrides for `generateMetadata`. Use the path with locale, e.g. `/en/week/2042/27`.
// Titles should be the segment before the site suffix only — `layout.tsx` applies `%s | WhatWeek.ca`.
// Example: "/en/week/2042/27": { title: "Week 27 of 2042 in Canada", description: "…" }

export type SeoOverride = {
  title?: string;
  description?: string;
};

export const seoOverrides: Record<string, SeoOverride> = {
  "/en/current-week-number-canada": {
    title: "Current week number in Canada today",
    description: "Find the current week number in Canada now, including Canada and ISO week systems with exact date ranges.",
  },
  "/fr/current-week-number-canada": {
    title: "Numéro de semaine actuel au Canada aujourd'hui",
    description: "Consultez le numéro de semaine actuel au Canada avec les systèmes Canada et ISO et les dates exactes.",
  },
  "/en/what-week-of-the-year-is-it": {
    title: "What week of the year is it in Canada?",
    description: "Quickly check what week of the year it is today in Canada, including ISO week and date range context.",
  },
  "/fr/what-week-of-the-year-is-it": {
    title: "Quelle semaine de l'année sommes-nous au Canada?",
    description: "Réponse rapide au numéro de semaine actuel au Canada avec contexte ISO et plage de dates.",
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
