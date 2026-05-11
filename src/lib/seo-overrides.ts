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
  "/en/date-to-week": {
    title: "Date to Week Number Converter",
    description: "Convert any date to an ISO or Canada week number. Supports 1900–2100 with start and end dates.",
  },
  "/fr/date-to-week": {
    title: "Convertisseur Date en Numéro de Semaine",
    description: "Convertissez n'importe quelle date en numéro de semaine ISO ou Canada. Supporte 1900–2100.",
  },
  "/en/business-days-calculator": {
    title: "Canada Business Days Calculator",
    description: "Count working days between two dates in Canada, excluding statutory holidays and weekends.",
  },
  "/fr/business-days-calculator": {
    title: "Calculatrice de Jours Ouvrables Canada",
    description: "Comptez les jours travaillés entre deux dates au Canada, hors jours fériés et week-ends.",
  },
  "/en/pay-period-calculator": {
    title: "2026 Canada Pay Period Calculator",
    description: "Plan your payroll with the 2026 Canada pay period calculator. Supports biweekly, semi-monthly, and weekly cycles.",
  },
  "/fr/pay-period-calculator": {
    title: "Calculateur de Périodes de Paie 2026 Canada",
    description: "Planifiez votre paie avec le calculateur 2026. Supporte les cycles bi-hebdomadaires, semi-mensuels et hebdomadaires.",
  },
  "/en/long-weekends/2026": {
    title: "2026 Long Weekends in Canada",
    description: "See all scheduled 2026 long weekends in Canada with exact dates and statutory holidays for every province.",
  },
  "/fr/long-weekends/2026": {
    title: "Longs Week-ends 2026 au Canada",
    description: "Consultez tous les longs week-ends prévus en 2026 au Canada avec dates exactes et jours fériés par province.",
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
