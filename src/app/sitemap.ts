import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { keywordPageOrder } from "@/lib/keyword-targets";
import { provinceCodes } from "@/lib/provinces";
import { getWeeksInIsoYear } from "@/lib/week";
import { getSitemapLastmod } from "@/lib/sitemap-lastmod";

const BASE_URL = "https://whatweek.ca";
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const NOW_YEAR = new Date().getUTCFullYear();
const TOOL_YEAR_MIN = NOW_YEAR - 2;
const TOOL_YEAR_MAX = NOW_YEAR + 4;

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

async function buildEntry(
  locale: "en" | "fr",
  pathWithoutLocale: string,
  options: Omit<MetadataRoute.Sitemap[number], "url" | "alternates" | "lastModified">,
): Promise<MetadataRoute.Sitemap[number]> {
  const lastModified = await getSitemapLastmod(locale, pathWithoutLocale);
  return {
    url: toAbsolute(`/${locale}${pathWithoutLocale}`),
    ...(lastModified ? { lastModified } : {}),
    alternates: localeAlternates(pathWithoutLocale),
    ...options,
  };
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

  if (id === "base") {
    const entriesByLocale = await Promise.all(
      locales.map(async (locale) => {
        const typedLocale = locale as "en" | "fr";
        const keywordEntries = await Promise.all(
          keywordPageOrder.map((slug) =>
            buildEntry(typedLocale, `/${slug}`, {
              changeFrequency: "weekly",
              priority: 0.78,
            }),
          ),
        );

        return [
          await buildEntry(typedLocale, "", {
            changeFrequency: "daily",
            priority: 1,
          }),
          await buildEntry(typedLocale, "/current-week-number-canada", {
            changeFrequency: "daily",
            priority: 0.9,
          }),
          await buildEntry(typedLocale, "/iso-week-number-canada", {
            changeFrequency: "daily",
            priority: 0.8,
          }),
          await buildEntry(typedLocale, "/date-to-week", {
            changeFrequency: "weekly",
            priority: 0.85,
          }),
          await buildEntry(typedLocale, "/business-days-calculator", {
            changeFrequency: "weekly",
            priority: 0.85,
          }),
          await buildEntry(typedLocale, "/pay-period-calculator", {
            changeFrequency: "weekly",
            priority: 0.85,
          }),
          await buildEntry(typedLocale, "/embed", {
            changeFrequency: "monthly",
            priority: 0.4,
          }),
          ...keywordEntries,
          await buildEntry(typedLocale, "/about", {
            changeFrequency: "monthly",
            priority: 0.5,
          }),
          await buildEntry(typedLocale, "/privacy", {
            changeFrequency: "monthly",
            priority: 0.4,
          }),
        ];
      }),
    );
    return entriesByLocale.flat();
  }

  const [locale, yearToken] = id.split("-");
  const year = Number(yearToken);
  if (!locales.includes(locale as (typeof locales)[number]) || !Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return [];
  }

  const typedLocale = locale as "en" | "fr";
  const calendarEntry = await buildEntry(typedLocale, `/calendar/${year}`, {
    changeFrequency: "yearly",
    priority: 0.8,
  });

  const weekEntries = await Promise.all(
    Array.from({ length: getWeeksInIsoYear(year) }, (_, index) => {
      const week = index + 1;
      return buildEntry(typedLocale, `/week/${year}/${week}`, {
        changeFrequency: "yearly",
        priority: 0.7,
      });
    }),
  );

  const toolEntries: MetadataRoute.Sitemap = [];
  if (year >= TOOL_YEAR_MIN && year <= TOOL_YEAR_MAX) {
    toolEntries.push(
      await buildEntry(typedLocale, `/year/${year}`, {
        changeFrequency: "monthly",
        priority: 0.75,
      }),
      await buildEntry(typedLocale, `/long-weekends/${year}`, {
        changeFrequency: "monthly",
        priority: 0.75,
      }),
    );
    for (const province of provinceCodes) {
      const slug = province.replace("CA-", "").toLowerCase();
      toolEntries.push(
        await buildEntry(typedLocale, `/statutory-holidays/${slug}/${year}`, {
          changeFrequency: "monthly",
          priority: 0.7,
        }),
      );
    }
  }

  return [calendarEntry, ...weekEntries, ...toolEntries];
}
