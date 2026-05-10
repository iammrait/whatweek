import type { Locale } from "@/lib/i18n";

export const canadianTimezoneSlugs = [
  "pacific",
  "mountain",
  "central",
  "eastern",
  "atlantic",
  "newfoundland",
] as const;

export type CanadianTimezoneSlug = (typeof canadianTimezoneSlugs)[number];

export type CanadianTimezone = {
  slug: CanadianTimezoneSlug;
  /** IANA time zone identifier used by Intl APIs. */
  ianaTimeZone: string;
  abbreviationStandard: string;
  abbreviationDaylight: string;
  utcOffsetStandard: string;
  utcOffsetDaylight: string;
  nameEn: string;
  nameFr: string;
  shortEn: string;
  shortFr: string;
  /** Provinces / territories observing this zone (en + fr). */
  regionsEn: string[];
  regionsFr: string[];
};

export const canadianTimezones: Record<CanadianTimezoneSlug, CanadianTimezone> = {
  pacific: {
    slug: "pacific",
    ianaTimeZone: "America/Vancouver",
    abbreviationStandard: "PST",
    abbreviationDaylight: "PDT",
    utcOffsetStandard: "UTC−8",
    utcOffsetDaylight: "UTC−7",
    nameEn: "Pacific Time (PST / PDT)",
    nameFr: "Heure du Pacifique (HNP / HAP)",
    shortEn: "Pacific",
    shortFr: "Pacifique",
    regionsEn: ["British Columbia (most)", "Yukon (winter only)"],
    regionsFr: ["Colombie-Britannique (majorité)", "Yukon (en hiver)"],
  },
  mountain: {
    slug: "mountain",
    ianaTimeZone: "America/Edmonton",
    abbreviationStandard: "MST",
    abbreviationDaylight: "MDT",
    utcOffsetStandard: "UTC−7",
    utcOffsetDaylight: "UTC−6",
    nameEn: "Mountain Time (MST / MDT)",
    nameFr: "Heure des Rocheuses (HNR / HAR)",
    shortEn: "Mountain",
    shortFr: "Rocheuses",
    regionsEn: ["Alberta", "Northwest Territories", "parts of British Columbia & Saskatchewan"],
    regionsFr: ["Alberta", "Territoires du Nord-Ouest", "parties de la Colombie-Britannique et de la Saskatchewan"],
  },
  central: {
    slug: "central",
    ianaTimeZone: "America/Winnipeg",
    abbreviationStandard: "CST",
    abbreviationDaylight: "CDT",
    utcOffsetStandard: "UTC−6",
    utcOffsetDaylight: "UTC−5",
    nameEn: "Central Time (CST / CDT)",
    nameFr: "Heure du Centre (HNC / HAC)",
    shortEn: "Central",
    shortFr: "Centre",
    regionsEn: ["Manitoba", "Saskatchewan (no DST)", "Western Ontario", "Nunavut (most)"],
    regionsFr: ["Manitoba", "Saskatchewan (sans heure d'été)", "ouest de l'Ontario", "Nunavut (majorité)"],
  },
  eastern: {
    slug: "eastern",
    ianaTimeZone: "America/Toronto",
    abbreviationStandard: "EST",
    abbreviationDaylight: "EDT",
    utcOffsetStandard: "UTC−5",
    utcOffsetDaylight: "UTC−4",
    nameEn: "Eastern Time (EST / EDT)",
    nameFr: "Heure de l'Est (HNE / HAE)",
    shortEn: "Eastern",
    shortFr: "Est",
    regionsEn: ["Ontario (most)", "Quebec (most)", "Eastern Nunavut"],
    regionsFr: ["Ontario (majorité)", "Québec (majorité)", "est du Nunavut"],
  },
  atlantic: {
    slug: "atlantic",
    ianaTimeZone: "America/Halifax",
    abbreviationStandard: "AST",
    abbreviationDaylight: "ADT",
    utcOffsetStandard: "UTC−4",
    utcOffsetDaylight: "UTC−3",
    nameEn: "Atlantic Time (AST / ADT)",
    nameFr: "Heure de l'Atlantique (HNA / HAA)",
    shortEn: "Atlantic",
    shortFr: "Atlantique",
    regionsEn: ["Nova Scotia", "New Brunswick", "Prince Edward Island", "most of Labrador"],
    regionsFr: ["Nouvelle-Écosse", "Nouveau-Brunswick", "Île-du-Prince-Édouard", "majorité du Labrador"],
  },
  newfoundland: {
    slug: "newfoundland",
    ianaTimeZone: "America/St_Johns",
    abbreviationStandard: "NST",
    abbreviationDaylight: "NDT",
    utcOffsetStandard: "UTC−3:30",
    utcOffsetDaylight: "UTC−2:30",
    nameEn: "Newfoundland Time (NST / NDT)",
    nameFr: "Heure de Terre-Neuve (HNT / HAT)",
    shortEn: "Newfoundland",
    shortFr: "Terre-Neuve",
    regionsEn: ["Newfoundland (island)", "Labrador's southeast coast"],
    regionsFr: ["Île de Terre-Neuve", "côte sud-est du Labrador"],
  },
};

export function isCanadianTimezoneSlug(value: string): value is CanadianTimezoneSlug {
  return (canadianTimezoneSlugs as readonly string[]).includes(value);
}

export function getTimezoneName(tz: CanadianTimezone, locale: Locale): string {
  return locale === "fr" ? tz.nameFr : tz.nameEn;
}

export function getTimezoneShortName(tz: CanadianTimezone, locale: Locale): string {
  return locale === "fr" ? tz.shortFr : tz.shortEn;
}

export function getTimezoneRegions(tz: CanadianTimezone, locale: Locale): string[] {
  return locale === "fr" ? tz.regionsFr : tz.regionsEn;
}
