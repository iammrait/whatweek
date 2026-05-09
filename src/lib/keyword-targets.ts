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
  { keyword: "what week is it", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "what week is it today", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "what week is it right now", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "what week is it this week", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "what week of the year is it", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "what week of the year is it today", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "weeks of the year", canonicalPath: "/weeks-in-a-year", supportPath: "/year-by-calendar", intent: "primary" },
  { keyword: "what year is it", canonicalPath: "/what-year-week-is-it", supportPath: "/current-week-number-canada", intent: "supporting" },
  { keyword: "weeks in a year", canonicalPath: "/weeks-in-a-year", supportPath: "/calendar/[year]", intent: "primary" },
  { keyword: "how many weeks for year", canonicalPath: "/weeks-in-a-year", supportPath: "/calendar/[year]", intent: "primary" },
  { keyword: "what's the current week number", canonicalPath: "/current-week-number-canada", supportPath: "/what-week-of-the-year-is-it", intent: "primary" },
  { keyword: "what year week is it", canonicalPath: "/what-year-week-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "current week number", canonicalPath: "/current-week-number-canada", supportPath: "/what-week-of-the-year-is-it", intent: "primary" },
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
  { keyword: "current week", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "which week is it", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "what week number is it", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
];

export type BodySection = {
  h2: string;
  paragraph: string;
  h3?: { heading: string; paragraph: string }[];
};

export type KeywordSnapshot = ReturnType<typeof getKeywordSnapshot>;

type PageContent = {
  title: (locale: Locale) => string;
  description: (locale: Locale) => string;
  h1: (locale: Locale) => string;
  intro: (locale: Locale) => string;
  faq: (locale: Locale, currentYear: number, weekNumber: number, dayOfYear: number, weekYear: number) => Array<{ question: string; answer: string }>;
  bodySections?: (locale: Locale, snap: KeywordSnapshot) => BodySection[];
};

export const keywordPages: Record<KeywordPageKey, PageContent> = {
  "what-week-of-the-year-is-it": {
    title: (locale) => (locale === "fr" ? "Quelle semaine sommes-nous? | WhatWeek.ca" : "What Week Is It? | Current Week Number Today"),
    description: (locale) =>
      locale === "fr"
        ? "Quelle semaine sommes-nous? Réponse instantanée : semaine actuelle, ISO 8601, Canada dim–sam, jour de l'année — aujourd'hui."
        : "What week is it right now? Instant answer for today's week number — ISO 8601, Canada Sun–Sat, day of year, and week-year. Live, free, bilingual.",
    h1: (locale) => (locale === "fr" ? "Quelle semaine sommes-nous?" : "What week is it?"),
    intro: (locale) =>
      locale === "fr"
        ? "Voici la semaine actuelle au Canada aujourd'hui, avec le numéro de semaine Canada et ISO pour planifier paie, école et échéances."
        : "Here is the current week of the year in Canada today, with both Canada and ISO week numbers for payroll, school, and planning.",
    faq: (locale, currentYear, weekNumber, dayOfYear, weekYear) => {
      const weeksInYear = getWeeksInIsoYear(currentYear);
      const weeksLeft = Math.max(0, weeksInYear - weekNumber);
      const weekPadded = String(weekNumber).padStart(2, "0");
      return [
        {
          question: locale === "fr" ? "Quelle semaine sommes-nous en ce moment?" : "What week are we in right now?",
          answer:
            locale === "fr"
              ? `Nous sommes à la semaine ${weekNumber} de ${currentYear} au Canada.`
              : `We are currently in week ${weekNumber} of ${currentYear} in Canada.`,
        },
        {
          question:
            locale === "fr"
              ? "Quelle est la différence entre la « semaine du jour » et la semaine ISO?"
              : "What's the difference between week today and the ISO week?",
          answer:
            locale === "fr"
              ? "La semaine Canada (dim.–sam.) et la semaine ISO 8601 (lun.–dim.) coïncident la plupart du temps, mais peuvent différer de 1 autour du 1ᵉʳ janvier et du 31 décembre. Choisissez un seul système et conservez-le pour toute l'année."
              : "Canada (Sun–Sat) and ISO 8601 (Mon–Sun) week numbers usually match, but can differ by 1 around January 1 and December 31. Pick one system and keep it for the whole year.",
        },
        {
          question: locale === "fr" ? `Combien de semaines y a-t-il en ${currentYear}?` : `How many weeks are in ${currentYear}?`,
          answer:
            locale === "fr"
              ? `${currentYear} compte ${weeksInYear} semaines ISO.`
              : `${currentYear} has ${weeksInYear} ISO weeks.`,
        },
        {
          question: locale === "fr" ? "Combien de semaines reste-t-il dans l'année?" : "How many weeks of the year are left?",
          answer:
            locale === "fr"
              ? `Il reste ${weeksLeft} semaines après la semaine ${weekNumber} en ${currentYear}.`
              : `There are ${weeksLeft} weeks of the year left after week ${weekNumber} in ${currentYear}.`,
        },
        {
          question: locale === "fr" ? "Combien de semaines avons-nous parcourues dans l'année?" : "How many weeks into the year are we?",
          answer:
            locale === "fr"
              ? `Nous sommes à ${weekNumber} semaines dans ${currentYear}, sur ${weeksInYear} au total.`
              : `We are ${weekNumber} weeks into ${currentYear}, out of ${weeksInYear} total.`,
        },
        {
          question: locale === "fr" ? "Quel jour de l'année sommes-nous?" : "What day of the year is it?",
          answer:
            locale === "fr"
              ? `Aujourd'hui est le jour ${dayOfYear} de ${currentYear}, dans la semaine ${weekNumber}.`
              : `Today is day ${dayOfYear} of ${currentYear}, inside week ${weekNumber}.`,
        },
        {
          question: locale === "fr" ? "Quelle année-semaine sommes-nous?" : "What year week is it?",
          answer:
            locale === "fr"
              ? `L'année-semaine ISO actuelle est ${weekYear}-W${weekPadded}. Elle peut différer de l'année civile pendant quelques jours en janvier et en décembre.`
              : `The current ISO week-year is ${weekYear}-W${weekPadded}. It can differ from the calendar year for a few days each January and December.`,
        },
      ];
    },
    bodySections: (locale, snap) => {
      const { canadaWeek, isoWeek, currentYear, dayOfYear, weeksInYear, weeksLeft } = snap;
      if (locale === "fr") {
        return [
          {
            h2: "Quelle semaine de l'année sommes-nous au Canada en ce moment ?",
            paragraph: `WhatWeek.ca calcule la semaine de l'année en direct avec un fuseau horaire canadien : la valeur affichée est toujours celle d'aujourd'hui. Le Canada est actuellement à la semaine ${canadaWeek} de ${currentYear}. La même date peut donner deux numéros différents selon le système : ISO 8601 (lundi–dimanche) est la norme internationale, tandis que les calendriers de paie, scolaires et d'entreprise au Canada utilisent souvent dimanche–samedi.`,
          },
          {
            h2: "« Semaine du jour » vs. semaine de l'année (ISO 8601 vs. dim.–sam.)",
            paragraph: `La semaine ISO ${isoWeek} et la semaine Canada ${canadaWeek} coïncident généralement, mais elles peuvent différer de 1 autour du 1ᵉʳ janvier et du 31 décembre. Choisissez le système utilisé par vos outils, puis conservez-le toute l'année. Mélanger les deux en cours d'année est la cause la plus fréquente d'erreurs de paie, de planification et de reporting.`,
          },
          {
            h2: "Combien de semaines avons-nous parcourues dans l'année ?",
            paragraph: `Nous sommes à ${canadaWeek} semaines dans ${currentYear}. Compter les semaines parcourues est utile pour les bilans OKR, l'avancement des projets, les sessions scolaires et les campagnes saisonnières. Le calcul correspond simplement au numéro de semaine actuel selon le système choisi.`,
          },
          {
            h2: "Combien de semaines reste-t-il dans l'année ?",
            paragraph: `${currentYear} contient ${weeksInYear} semaines ISO, ce qui laisse ${weeksLeft} semaines après la semaine ${canadaWeek}. Pratique pour cadrer les échéances de fin de trimestre, planifier le prochain long week-end et budgéter les jours de congé restants. Certaines années se terminent à la semaine 53 plutôt que 52—vérifiez avant de présumer.`,
          },
          {
            h2: "Quel jour de l'année sommes-nous ?",
            paragraph: `Aujourd'hui est le jour ${dayOfYear} de ${currentYear}, dans la semaine ${canadaWeek}. Le jour de l'année (jour ordinal, jour julien, DOY) va de 1 à 365, ou 366 lors d'une année bissextile. Il complète le numéro de semaine pour suivre des objectifs annuels au jour près—ingénierie, sciences, agriculture, projets longs.`,
          },
        ];
      }
      return [
        {
          h2: "What week of the year is it right now in Canada?",
          paragraph: `WhatWeek.ca calculates the current week of the year in real time using a Canadian time zone, so the answer is always today's value. Canada is currently in week ${canadaWeek} of ${currentYear}. The same date can produce two different week numbers depending on the system you choose: ISO 8601 (Monday–Sunday) is used internationally, while Canadian payroll, school, and business calendars often run Sunday–Saturday.`,
        },
        {
          h2: "Week today vs. week of the year (ISO 8601 vs. Sun–Sat)",
          paragraph: `ISO week ${isoWeek} and Canada week ${canadaWeek} usually match, but they can differ by 1 around January 1 and December 31. Pick whichever standard your tools use, then stick with it for the whole year. Mixing systems mid-year is the most common source of payroll, scheduling, and reporting errors.`,
        },
        {
          h2: "How many weeks into the year are we?",
          paragraph: `We're ${canadaWeek} weeks into ${currentYear}. Counting weeks-into-the-year is useful for OKR check-ins, project burn-down, school terms, and seasonal marketing campaigns. The metric is simply the current week number under the system you've chosen.`,
        },
        {
          h2: "How many weeks of the year are left?",
          paragraph: `${currentYear} contains ${weeksInYear} ISO weeks, which leaves ${weeksLeft} weeks ahead of week ${canadaWeek}. Use it to scope quarter-end deadlines, plan the next long weekend, and budget remaining vacation days. Some years end on week 53 instead of week 52—check before assuming.`,
        },
        {
          h2: "What day of the year is it?",
          paragraph: `Today is day ${dayOfYear} of ${currentYear}, inside week ${canadaWeek}. The day-of-year (ordinal day, Julian day, DOY) runs 1–365, or 1–366 in a leap year. It complements the week number for tracking annualized goals at daily granularity—engineering, science, agriculture, long-running projects.`,
        },
      ];
    },
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
  const weeksInYear = getWeeksInIsoYear(currentYear);
  const weeksLeft = Math.max(0, weeksInYear - canadaWeek);
  return { today, currentYear, canadaWeek, isoWeek, weekYear, dayOfYear, dayName, weeksInYear, weeksLeft };
}
