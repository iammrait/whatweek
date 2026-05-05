// Optional per-path overrides for `generateMetadata`. Use the path with locale, e.g. `/en/week/2042/27`.
// Titles should be the segment before the site suffix only — `layout.tsx` applies `%s | WhatWeek.ca`.
// Example: "/en/week/2042/27": { title: "Week 27 of 2042 in Canada", description: "…" }

export type SeoOverride = {
  title?: string;
  description?: string;
};

export const seoOverrides: Record<string, SeoOverride> = {
  // Add your mappings from the CSV here!
  // Example:
  // "/en/week/2026/1": { title: "Week 1 of 2026 in Canada | WhatWeek.ca", description: "Date range for week 1 in 2026 in Canada, with ISO context. This timeline is useful for business planning, payroll, and holidays." },
};

/**
 * Helper to get the SEO override for a specific path.
 * The path should include the locale, e.g., "en/week/2026/1" or "/en/week/2026/1"
 */
export function getSeoOverride(path: string): SeoOverride | undefined {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return seoOverrides[normalizedPath];
}
