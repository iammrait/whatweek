import type { Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { getCanadaWeekNumber, getIsoWeekNumber, getTodayInTimeZone, getWeekYear, getWeeksInIsoYear } from "@/lib/week";

export type KeywordPageKey =
  | "what-week-of-the-year-is-it"
  | "what-year-week-is-it"
  | "weeks-in-a-year"
  | "what-day-of-the-year-is-it"
  | "what-day-of-the-week"
  | "weeks-and-months"
  | "year-by-calendar"
  | "week-by-year";

export type KeywordTargetEntry = {
  keyword: string;
  canonicalPath: string;
  supportPath: string;
  intent: "primary" | "supporting";
};

export const keywordTargetMap: KeywordTargetEntry[] = [
  { keyword: "what week of the year is it", canonicalPath: "/current-week-number-canada", supportPath: "/what-week-of-the-year-is-it", intent: "primary" },
  { keyword: "weeks of the year", canonicalPath: "/weeks-in-a-year", supportPath: "/year-by-calendar", intent: "primary" },
  { keyword: "what year is it", canonicalPath: "/what-year-week-is-it", supportPath: "/current-week-number-canada", intent: "supporting" },
  { keyword: "weeks in a year", canonicalPath: "/weeks-in-a-year", supportPath: "/calendar/[year]", intent: "primary" },
  { keyword: "how many weeks for year", canonicalPath: "/weeks-in-a-year", supportPath: "/calendar/[year]", intent: "primary" },
  { keyword: "What's the Current Week Number", canonicalPath: "/current-week-number-canada", supportPath: "/what-week-of-the-year-is-it", intent: "primary" },
  { keyword: "what year week is it", canonicalPath: "/what-year-week-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "what day of the year is it", canonicalPath: "/what-day-of-the-year-is-it", supportPath: "/what-day-of-the-week", intent: "primary" },
  { keyword: "weeks and months", canonicalPath: "/weeks-and-months", supportPath: "/year-by-calendar", intent: "primary" },
  { keyword: "year by calendar", canonicalPath: "/year-by-calendar", supportPath: "/weeks-in-a-year", intent: "primary" },
  { keyword: "week of the year", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "week by year", canonicalPath: "/week-by-year", supportPath: "/calendar/[year]", intent: "primary" },
  { keyword: "what day of the week", canonicalPath: "/what-day-of-the-week", supportPath: "/what-day-of-the-year-is-it", intent: "primary" },
  { keyword: "how many weeks of the year", canonicalPath: "/weeks-in-a-year", supportPath: "/calendar/[year]", intent: "primary" },
  { keyword: "what week of the year is it this week", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "weeks into the year", canonicalPath: "/what-day-of-the-year-is-it", supportPath: "/weeks-in-a-year", intent: "supporting" },
  { keyword: "week today", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
];

type PageContent = {
  title: (locale: Locale) => string;
  description: (locale: Locale) => string;
  h1: (locale: Locale) => string;
  intro: (locale: Locale) => string;
  faq: (locale: Locale, currentYear: number, weekNumber: number, dayOfYear: number, weekYear: number) => Array<{ question: string; answer: string }>;
};

export const keywordPages: Record<KeywordPageKey, PageContent> = {
  "what-week-of-the-year-is-it": {
    title: (locale) => (locale === "fr" ? "Quelle semaine de l'année sommes-nous au Canada?" : "What Week of the Year Is It in Canada?"),
    description: (locale) =>
      locale === "fr"
        ? "Réponse instantanée : numéro de semaine actuel au Canada (Canada et ISO), avec les dates de début et de fin."
        : "Instant answer for the current week of the year in Canada, including Canada and ISO week numbers with start/end dates.",
    h1: (locale) => (locale === "fr" ? "Quelle semaine de l'année sommes-nous?" : "What Week of the Year Is It?"),
    intro: (locale) =>
      locale === "fr"
        ? "Voici la semaine actuelle au Canada aujourd'hui, avec le numéro de semaine Canada et ISO pour planifier paie, école et échéances."
        : "Here is the current week of the year in Canada today, with both Canada and ISO week numbers for payroll, school, and planning.",
    faq: (locale, currentYear, weekNumber) => [
      {
        question: locale === "fr" ? "Quelle semaine sommes-nous en ce moment?" : "What week are we in right now?",
        answer: locale === "fr" ? `Nous sommes à la semaine ${weekNumber} au Canada.` : `We are currently in week ${weekNumber} in Canada.`,
      },
      {
        question: locale === "fr" ? `Combien de semaines y a-t-il en ${currentYear}?` : `How many weeks are in ${currentYear}?`,
        answer: locale === "fr" ? `${currentYear} compte ${getWeeksInIsoYear(currentYear)} semaines ISO.` : `${currentYear} has ${getWeeksInIsoYear(currentYear)} ISO weeks.`,
      },
    ],
  },
  "what-year-week-is-it": {
    title: (locale) => (locale === "fr" ? "Année et semaine actuelles au Canada" : "What Year Week Is It in Canada?"),
    description: (locale) =>
      locale === "fr"
        ? "Consultez l'année de semaine en cours et le numéro de semaine actuel au Canada avec conversion ISO."
        : "Check the current week year and week number in Canada, including ISO week-year context.",
    h1: (locale) => (locale === "fr" ? "Quelle année-semaine sommes-nous?" : "What Year Week Is It?"),
    intro: (locale) =>
      locale === "fr"
        ? "Cette page affiche l'année-semaine courante et le numéro de semaine du Canada pour aligner vos opérations et rapports."
        : "This page shows the current week-year and Canada week number to align reports, operations, and planning.",
    faq: (locale, currentYear, weekNumber, _d, weekYear) => [
      {
        question: locale === "fr" ? "L'année de semaine peut-elle différer de l'année civile?" : "Can the week year differ from the calendar year?",
        answer:
          locale === "fr"
            ? `Oui. En ce moment, l'année de semaine est ${weekYear} et l'année civile est ${currentYear}.`
            : `Yes. The current week-year is ${weekYear} while the calendar year is ${currentYear}.`,
      },
      {
        question: locale === "fr" ? "Quel est le numéro de semaine actuel?" : "What is the current week number?",
        answer: locale === "fr" ? `Le numéro de semaine actuel est ${weekNumber}.` : `The current week number is ${weekNumber}.`,
      },
    ],
  },
  "weeks-in-a-year": {
    title: (locale) => (locale === "fr" ? "Combien de semaines dans une année au Canada?" : "Weeks in a Year in Canada"),
    description: (locale) =>
      locale === "fr"
        ? "Découvrez combien de semaines contient une année et naviguez vers les calendriers annuels canadiens."
        : "Learn how many weeks are in a year and jump to Canadian year-by-year week calendars.",
    h1: (locale) => (locale === "fr" ? "Combien de semaines dans une année?" : "How Many Weeks in a Year?"),
    intro: (locale) =>
      locale === "fr"
        ? "La plupart des années ont 52 semaines, certaines en ont 53 selon ISO 8601. Vérifiez rapidement l'année courante et les années voisines."
        : "Most years have 52 weeks, and some have 53 under ISO 8601. Quickly check the current year and nearby years.",
    faq: (locale, currentYear) => [
      {
        question: locale === "fr" ? `Combien de semaines en ${currentYear}?` : `How many weeks are in ${currentYear}?`,
        answer: locale === "fr" ? `${currentYear} compte ${getWeeksInIsoYear(currentYear)} semaines ISO.` : `${currentYear} has ${getWeeksInIsoYear(currentYear)} ISO weeks.`,
      },
      {
        question: locale === "fr" ? "Toutes les années ont-elles 52 semaines?" : "Do all years have 52 weeks?",
        answer:
          locale === "fr"
            ? "Non. Certaines années ISO ont 53 semaines selon la position du premier jeudi."
            : "No. Some ISO years contain 53 weeks depending on where the first Thursday falls.",
      },
    ],
  },
  "what-day-of-the-year-is-it": {
    title: (locale) => (locale === "fr" ? "Quel jour de l'année sommes-nous?" : "What Day of the Year Is It in Canada?"),
    description: (locale) =>
      locale === "fr"
        ? "Calculez instantanément le jour de l'année aujourd'hui au Canada avec le contexte semaine et année."
        : "Instantly calculate today's day of the year in Canada with week and year context.",
    h1: (locale) => (locale === "fr" ? "Quel jour de l'année sommes-nous?" : "What Day of the Year Is It?"),
    intro: (locale) =>
      locale === "fr"
        ? "Affiche le numéro du jour dans l'année, utile pour le suivi d'objectifs, la production et les échéanciers."
        : "Shows the day number in the current year, useful for goal tracking, production plans, and annual timelines.",
    faq: (locale, currentYear, weekNumber, dayOfYear) => [
      {
        question: locale === "fr" ? "Quel jour de l'année est aujourd'hui?" : "What day of the year is today?",
        answer: locale === "fr" ? `Aujourd'hui est le jour ${dayOfYear} de ${currentYear}.` : `Today is day ${dayOfYear} of ${currentYear}.`,
      },
      {
        question: locale === "fr" ? "Ce jour correspond à quelle semaine?" : "Which week does this day fall in?",
        answer: locale === "fr" ? `Ce jour est dans la semaine ${weekNumber}.` : `This day falls in week ${weekNumber}.`,
      },
    ],
  },
  "what-day-of-the-week": {
    title: (locale) => (locale === "fr" ? "Quel jour de la semaine sommes-nous?" : "What Day of the Week Is It in Canada?"),
    description: (locale) =>
      locale === "fr"
        ? "Consultez le jour actuel de la semaine au Canada et son contexte dans l'année et la semaine."
        : "Check the current day of the week in Canada with week and year context.",
    h1: (locale) => (locale === "fr" ? "Quel jour de la semaine sommes-nous?" : "What Day of the Week Is It?"),
    intro: (locale) =>
      locale === "fr"
        ? "Réponse rapide pour le jour actuel de la semaine au Canada, utile pour horaires, délais et routines."
        : "Quick answer for today's weekday in Canada, useful for scheduling, due dates, and weekly routines.",
    faq: (locale, currentYear, weekNumber) => [
      {
        question: locale === "fr" ? "Quel jour de la semaine est-ce aujourd'hui?" : "What day of the week is it today?",
        answer:
          locale === "fr"
            ? "Le jour actuel est affiché en direct selon le fuseau horaire canadien."
            : "The current weekday is shown live using a Canada time-zone date.",
      },
      {
        question: locale === "fr" ? "Dans quelle semaine est ce jour?" : "What week is this day in?",
        answer: locale === "fr" ? `Ce jour fait partie de la semaine ${weekNumber} de ${currentYear}.` : `This day is in week ${weekNumber} of ${currentYear}.`,
      },
    ],
  },
  "weeks-and-months": {
    title: (locale) => (locale === "fr" ? "Semaines et mois au Canada" : "Weeks and Months Calendar Guide"),
    description: (locale) =>
      locale === "fr"
        ? "Comprendre comment les semaines s'alignent avec les mois dans le calendrier canadien."
        : "Understand how weeks align with months in the Canadian week-number calendar.",
    h1: (locale) => (locale === "fr" ? "Semaines et mois" : "Weeks and Months"),
    intro: (locale) =>
      locale === "fr"
        ? "Utilisez ce guide pour comprendre les chevauchements semaines-mois et mieux planifier les cycles mensuels."
        : "Use this guide to understand week-month overlap and plan month-based operations with week numbers.",
    faq: (locale) => [
      {
        question: locale === "fr" ? "Une semaine peut-elle chevaucher deux mois?" : "Can one week span two months?",
        answer:
          locale === "fr"
            ? "Oui. C'est fréquent dans les calendriers hebdomadaires, surtout au début et à la fin d'un mois."
            : "Yes. This is common in week-based calendars, especially near month boundaries.",
      },
      {
        question: locale === "fr" ? "Quel calendrier faut-il utiliser pour la paie?" : "Which calendar should payroll use?",
        answer:
          locale === "fr"
            ? "Choisissez un système cohérent (Canada ou ISO) et gardez-le pour toute l'année."
            : "Pick one consistent week system (Canada or ISO) and keep it throughout the year.",
      },
    ],
  },
  "year-by-calendar": {
    title: (locale) => (locale === "fr" ? "Année par calendrier des semaines" : "Year by Calendar (Week Numbers)"),
    description: (locale) =>
      locale === "fr"
        ? "Naviguez année par année avec les numéros de semaine du calendrier canadien."
        : "Navigate year-by-year using Canada week-number calendars and yearly facts.",
    h1: (locale) => (locale === "fr" ? "Année par calendrier" : "Year by Calendar"),
    intro: (locale) =>
      locale === "fr"
        ? "Parcourez les années pour comparer les numéros de semaine, les périodes et les variations 52/53 semaines."
        : "Browse year calendars to compare week numbers, annual patterns, and 52/53-week differences.",
    faq: (locale, currentYear) => [
      {
        question: locale === "fr" ? "Comment comparer deux années?" : "How do I compare two years?",
        answer:
          locale === "fr"
            ? `Commencez par ${currentYear}, puis ouvrez les années voisines depuis la navigation calendrier.`
            : `Start with ${currentYear}, then open nearby years from the calendar navigation.`,
      },
      {
        question: locale === "fr" ? "Pourquoi certaines années ont 53 semaines?" : "Why do some years have 53 weeks?",
        answer:
          locale === "fr"
            ? "Parce que l'alignement ISO du calendrier crée parfois une semaine supplémentaire."
            : "Because ISO week alignment can produce an extra week in some years.",
      },
    ],
  },
  "week-by-year": {
    title: (locale) => (locale === "fr" ? "Semaine par année au Canada" : "Week by Year in Canada"),
    description: (locale) =>
      locale === "fr"
        ? "Explorez les semaines par année avec des liens directs vers chaque semaine du calendrier."
        : "Explore week-by-year indexes with direct links to specific week detail pages.",
    h1: (locale) => (locale === "fr" ? "Semaine par année" : "Week by Year"),
    intro: (locale) =>
      locale === "fr"
        ? "Accès rapide aux semaines par année pour planification, publication et opérations."
        : "Quick access to week-by-year navigation for planning, publishing schedules, and operations.",
    faq: (locale, currentYear) => [
      {
        question: locale === "fr" ? "Où trouver une semaine précise?" : "How do I find a specific week?",
        answer:
          locale === "fr"
            ? `Ouvrez le calendrier ${currentYear}, puis sélectionnez le numéro de semaine voulu.`
            : `Open the ${currentYear} calendar and select the week number you need.`,
      },
      {
        question: locale === "fr" ? "Les semaines suivent-elles ISO?" : "Are the weeks ISO-based?",
        answer:
          locale === "fr"
            ? "Oui, les pages semaine/année suivent ISO 8601 (lundi à dimanche)."
            : "Yes, the week/year routes use ISO 8601 (Monday to Sunday).",
      },
    ],
  },
};

export const keywordPageOrder: KeywordPageKey[] = [
  "what-week-of-the-year-is-it",
  "what-year-week-is-it",
  "weeks-in-a-year",
  "what-day-of-the-year-is-it",
  "what-day-of-the-week",
  "weeks-and-months",
  "year-by-calendar",
  "week-by-year",
];

export function getKeywordSnapshot() {
  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const currentYear = today.getUTCFullYear();
  const canadaWeek = getCanadaWeekNumber(today);
  const isoWeek = getIsoWeekNumber(today);
  const weekYear = getWeekYear(today, "iso");
  const dayOfYear = Math.floor((today.getTime() - Date.UTC(currentYear, 0, 1, 12, 0, 0)) / 86400000) + 1;
  const dayName = new Intl.DateTimeFormat("en-CA", { weekday: "long", timeZone: defaultCanadaTimeZone }).format(today);
  return { today, currentYear, canadaWeek, isoWeek, weekYear, dayOfYear, dayName };
}
