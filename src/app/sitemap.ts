import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getWeeksInIsoYear, startOfIsoWeek } from "@/lib/week";

const BASE_URL = "https://whatweek.ca";
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

type SitemapBucketId = "base" | `${"en" | "fr"}-${number}`;

function toAbsolute(path: string): string {
  return `${BASE_URL}${path}`;
}

function localeAlternates(pathWithoutLocale: string) {
  return {
    languages: {
      "en-CA": toAbsolute(`/en${pathWithoutLocale}`),
      "fr-CA": toAbsolute(`/fr${pathWithoutLocale}`),
      "x-default": toAbsolute("/en"),
    },
  } as const;
}

function buildWeekLastModified(year: number, week: number, now: Date): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4, 12, 0, 0));
  const firstWeekStart = startOfIsoWeek(jan4);
  const weekStart = new Date(firstWeekStart);
  weekStart.setUTCDate(firstWeekStart.getUTCDate() + (week - 1) * 7);
  return weekStart > now ? now : weekStart;
}

export async function generateSitemaps(): Promise<Array<{ id: SitemapBucketId }>> {
  const ids: Array<{ id: SitemapBucketId }> = [{ id: "base" }];
  for (const locale of locales) {
    for (let year = MIN_YEAR; year <= MAX_YEAR; year += 1) {
      ids.push({ id: `${locale}-${year}` });
    }
  }
  return ids;
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const rawId = await props.id;
  const id = rawId as SitemapBucketId;
  const now = new Date();
  const currentWeekStart = startOfIsoWeek(now);

  if (id === "base") {
    return locales.flatMap((locale) => [
      {
        url: toAbsolute(`/${locale}`),
        lastModified: now,
        changeFrequency: "daily",
        priority: 1,
        alternates: localeAlternates(""),
      },
      {
        url: toAbsolute(`/${locale}/current-week-number-canada`),
        lastModified: currentWeekStart,
        changeFrequency: "daily",
        priority: 0.9,
        alternates: localeAlternates("/current-week-number-canada"),
      },
      {
        url: toAbsolute(`/${locale}/iso-week-number-canada`),
        lastModified: currentWeekStart,
        changeFrequency: "daily",
        priority: 0.8,
        alternates: localeAlternates("/iso-week-number-canada"),
      },
    ]);
  }

  const [locale, yearToken] = id.split("-");
  const year = Number(yearToken);
  if (!locales.includes(locale as (typeof locales)[number]) || !Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return [];
  }

  const calendarPath = `/${locale}/calendar/${year}`;
  const calendarEntry: MetadataRoute.Sitemap[number] = {
    url: toAbsolute(calendarPath),
    lastModified: new Date(Date.UTC(year, 11, 31, 12, 0, 0)),
    changeFrequency: "yearly",
    priority: 0.8,
    alternates: localeAlternates(`/calendar/${year}`),
  };

  const weekEntries: MetadataRoute.Sitemap = Array.from({ length: getWeeksInIsoYear(year) }, (_, index) => {
    const week = index + 1;
    return {
      url: toAbsolute(`/${locale}/week/${year}/${week}`),
      lastModified: buildWeekLastModified(year, week, now),
      changeFrequency: "yearly",
      priority: 0.7,
      alternates: localeAlternates(`/week/${year}/${week}`),
    };
  });

  return [calendarEntry, ...weekEntries];
}
