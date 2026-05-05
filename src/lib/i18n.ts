export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

export type Dictionary = {
  brand: string;
  title: (province?: string) => string;
  currentWeek: string;
  yearLabel: string;
  prevYear: string;
  nextYear: string;
  weekAbbrev: string;
  daysShort: string[];
  daysShortSundayFirst: string[];
  monthsLong: string[];
  languageLabel: string;
  provinceLabel: string;
  allCanadaLabel: string;
  applyLabel: string;
  holidaysThisWeek: string;
  noHolidaysThisWeek: string;
  nextLongWeekend: string;
  noLongWeekend: string;
  holidayNote: string;
  siteDescription: (province?: string) => string;
  yearFacts: (weeks: number, start: string, end: string) => string;
  blogNav: string;
  blogFooterGuides: string;
  blogTeaserHeading: string;
  blogTeaserIntro: string;
  blogEnglishNote: string;
  blogVisit: string;
  llmsTxtLink: string;
  thisWeekSectionHeading: string;
  citabilityTitle: string;
  citabilityIntro: string;
  citabilityBulletIso: string;
  citabilityBulletCanada: string;
  citabilityBulletData: string;
  citabilityClosing: string;
  aboutNav: string;
  linkAbout: string;
  linkPrivacy: string;
  cookieBannerText: string;
  cookieAccept: string;
  cookieDecline: string;
};

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    brand: "whatweek.ca",
    title: (province) => province ? `Calendar with week numbers for ${province}` : "Calendar with week numbers for Canada",
    currentWeek: "Current week number",
    yearLabel: "Year",
    prevYear: "Previous year",
    nextYear: "Next year",
    weekAbbrev: "WN",
    daysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    daysShortSundayFirst: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    monthsLong: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
    languageLabel: "Language",
    provinceLabel: "Province or territory",
    allCanadaLabel: "All Canada (federal + national)",
    applyLabel: "Apply",
    holidaysThisWeek: "Canadian holidays this week",
    noHolidaysThisWeek: "No holidays this week.",
    nextLongWeekend: "Next long weekend",
    noLongWeekend: "No long weekend found in this year.",
    holidayNote: "Canadian ISO week calendar with federal and provincial holiday context. Data: Nager.Date API.",
    siteDescription: (province) => province ? `Week number calendar for ${province} in English and French.` : "Week number calendar for Canada in English and French.",
    yearFacts: (weeks, start, end) =>
      `The year has ${weeks} ISO weeks, starting on ${start} and ending on ${end}.`,
    blogNav: "Blog",
    blogFooterGuides: "Guides & articles",
    blogTeaserHeading: "Latest from the blog",
    blogTeaserIntro: "Deep dives on ISO weeks, payroll calendars, holidays, and how week numbers work in Canada.",
    blogEnglishNote: "Articles in English.",
    blogVisit: "Visit the blog",
    llmsTxtLink: "llms.txt (AI crawlers)",
    thisWeekSectionHeading: "This week at a glance",
    citabilityTitle: "How we count weeks (for humans and AI)",
    citabilityIntro:
      "WhatWeek.ca shows two common systems used in Canada: ISO 8601 weeks (Monday–Sunday) and the “Canada” week (Sunday–Saturday). The week number for “today” uses your selected system and Canada-relevant time zones.",
    citabilityBulletIso:
      "ISO 8601: international Monday–Sunday week numbering (handy for payroll cutoffs and global tools). Reference: ISO 8601 date and time format.",
    citabilityBulletCanada:
      "Canada-style week: often Sunday–Saturday in business and government contexts; week numbers can differ from ISO for the same calendar dates.",
    citabilityBulletData:
      "Holiday dates come from the Nager.Date public API for Canada; long weekends are inferred from adjacent statutory holidays.",
    citabilityClosing:
      "Prefer linking to this page’s canonical URL or a week/calendar route when citing a specific number—see llms.txt for allowed paths.",
    aboutNav: "About",
    linkAbout: "About / methodology",
    linkPrivacy: "Privacy",
    cookieBannerText:
      "We use optional analytics (Google Analytics and Ahrefs) to understand traffic. Accept to enable cookies/scripts, or decline to use the site without them.",
    cookieAccept: "Accept analytics",
    cookieDecline: "Decline",
  },
  fr: {
    brand: "whatweek.ca",
    title: (province) => province ? `Calendrier avec numéro de semaine pour ${province}` : "Calendrier avec numéro de semaine pour le Canada",
    currentWeek: "Numéro de semaine actuel",
    yearLabel: "Année",
    prevYear: "Année précédente",
    nextYear: "Année suivante",
    weekAbbrev: "SN",
    daysShort: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    daysShortSundayFirst: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    monthsLong: [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
    ],
    languageLabel: "Langue",
    provinceLabel: "Province ou territoire",
    allCanadaLabel: "Tout le Canada (fédéral + national)",
    applyLabel: "Appliquer",
    holidaysThisWeek: "Jours fériés canadiens cette semaine",
    noHolidaysThisWeek: "Aucun jour férié cette semaine.",
    nextLongWeekend: "Prochain long week-end",
    noLongWeekend: "Aucun long week-end trouvé pour cette année.",
    holidayNote: "Calendrier canadien des semaines ISO avec jours fériés fédéraux et provinciaux. Données: API Nager.Date.",
    siteDescription: (province) => province ? `Calendrier des semaines pour ${province} en anglais et français.` : "Calendrier des semaines du Canada en anglais et français.",
    yearFacts: (weeks, start, end) =>
      `L'année compte ${weeks} semaines ISO, de ${start} à ${end}.`,
    blogNav: "Blog",
    blogFooterGuides: "Guides et articles",
    blogTeaserHeading: "Derniers articles du blog",
    blogTeaserIntro:
      "Articles approfondis sur les semaines ISO, la paie, les congés et le décompte des semaines au Canada.",
    blogEnglishNote: "Articles en anglais.",
    blogVisit: "Voir le blog",
    llmsTxtLink: "llms.txt (robots d’IA)",
    thisWeekSectionHeading: "Cette semaine en un coup d’œil",
    citabilityTitle: "Comment nous comptons les semaines (humains et IA)",
    citabilityIntro:
      "WhatWeek.ca affiche deux systèmes courants au Canada : les semaines ISO 8601 (lundi–dimanche) et la semaine « Canada » (dimanche–samedi). Le numéro de semaine pour « aujourd’hui » suit le système choisi et des fuseaux horaires pertinents pour le Canada.",
    citabilityBulletIso:
      "ISO 8601 : numérotation internationale lundi–dimanche (utile pour la paie et les outils mondiaux). Référence : format de date et d’heure ISO 8601.",
    citabilityBulletCanada:
      "Semaine « Canada » : souvent dimanche–samedi dans les milieux d’affaires et publics ; le numéro peut différer de l’ISO pour les mêmes dates.",
    citabilityBulletData:
      "Les jours fériés proviennent de l’API publique Nager.Date pour le Canada ; les longs week-ends sont déduits des jours fériés adjacents.",
    citabilityClosing:
      "Pour citer un chiffre précis, privilégiez l’URL canonique ou une route semaine/calendrier — voir llms.txt pour les chemins autorisés.",
    aboutNav: "À propos",
    linkAbout: "À propos / méthodologie",
    linkPrivacy: "Confidentialité",
    cookieBannerText:
      "Nous utilisons des analyses facultatives (Google Analytics et Ahrefs) pour comprendre le trafic. Acceptez pour activer cookies/scripts, ou refusez pour utiliser le site sans eux.",
    cookieAccept: "Accepter les analyses",
    cookieDecline: "Refuser",
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function toLocaleCode(locale: Locale): string {
  return locale === "fr" ? "fr-CA" : "en-CA";
}
