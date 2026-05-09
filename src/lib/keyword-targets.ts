import type { Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { getCanadaWeekNumber, getIsoWeekNumber, getTodayInTimeZone, getWeekYear, getWeeksInIsoYear, startOfIsoWeek } from "@/lib/week";

export type KeywordPageKey =
  | "what-week-is-it"
  | "what-week-of-the-year-is-it"
  | "what-year-week-is-it"
  | "weeks-in-a-year"
  | "what-day-of-the-year-is-it"
  | "what-day-of-the-week"
  | "weeks-and-months"
  | "year-by-calendar"
  | "week-by-year"
  | "week-dates-and-iso-number"
  | "weeks-into-the-year"
  | "what-week-number"
  | "day-of-year-and-weekday"
  | "weeks-and-months-calendar"
  | "calendar-year-view"
  | "week-by-year-index";

export type KeywordTargetEntry = {
  keyword: string;
  canonicalPath: string;
  supportPath: string;
  intent: "primary" | "supporting";
};

export const keywordTargetMap: KeywordTargetEntry[] = [
  // Core "what week is it" cluster (short query → /what-week-is-it)
  { keyword: "what week is it", canonicalPath: "/what-week-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "what week is it today", canonicalPath: "/what-week-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "what week is it right now", canonicalPath: "/what-week-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "what week is it this week", canonicalPath: "/what-week-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "week today", canonicalPath: "/what-week-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "current week", canonicalPath: "/what-week-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "which week is it", canonicalPath: "/what-week-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  // "What week of the year is it" cluster (long query → /what-week-of-the-year-is-it)
  { keyword: "what week of the year is it", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/what-week-is-it", intent: "primary" },
  { keyword: "what week of the year is it today", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/what-week-is-it", intent: "primary" },
  { keyword: "what week of the year is it right now", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/what-week-is-it", intent: "primary" },
  { keyword: "what week number is it", canonicalPath: "/what-week-number", supportPath: "/what-week-of-the-year-is-it", intent: "primary" },
  // Week dates and ISO
  { keyword: "week dates and ISO week number", canonicalPath: "/week-dates-and-iso-number", supportPath: "/what-week-of-the-year-is-it", intent: "primary" },
  { keyword: "ISO week number dates", canonicalPath: "/week-dates-and-iso-number", supportPath: "/what-week-of-the-year-is-it", intent: "primary" },
  { keyword: "what week of the year week dates", canonicalPath: "/week-dates-and-iso-number", supportPath: "/what-week-of-the-year-is-it", intent: "primary" },
  // Weeks into the year
  { keyword: "weeks into the year so far", canonicalPath: "/weeks-into-the-year", supportPath: "/what-week-of-the-year-is-it", intent: "primary" },
  { keyword: "how many weeks into the year", canonicalPath: "/weeks-into-the-year", supportPath: "/what-week-of-the-year-is-it", intent: "primary" },
  { keyword: "weeks into the year", canonicalPath: "/weeks-into-the-year", supportPath: "/what-week-of-the-year-is-it", intent: "primary" },
  // Weeks in a year
  { keyword: "weeks of the year", canonicalPath: "/weeks-in-a-year", supportPath: "/year-by-calendar", intent: "primary" },
  { keyword: "weeks in a year", canonicalPath: "/weeks-in-a-year", supportPath: "/calendar/[year]", intent: "primary" },
  { keyword: "how many weeks for year", canonicalPath: "/weeks-in-a-year", supportPath: "/calendar/[year]", intent: "primary" },
  { keyword: "how many weeks of the year", canonicalPath: "/weeks-in-a-year", supportPath: "/calendar/[year]", intent: "primary" },
  // Day of year
  { keyword: "what day of the year is it", canonicalPath: "/what-day-of-the-year-is-it", supportPath: "/what-day-of-the-week", intent: "primary" },
  { keyword: "day of the year and day of the week", canonicalPath: "/day-of-year-and-weekday", supportPath: "/what-day-of-the-year-is-it", intent: "primary" },
  { keyword: "what day of the year", canonicalPath: "/what-day-of-the-year-is-it", supportPath: "/what-day-of-the-week", intent: "primary" },
  // Weeks and months
  { keyword: "weeks and months in the calendar", canonicalPath: "/weeks-and-months-calendar", supportPath: "/weeks-and-months", intent: "primary" },
  { keyword: "weeks and months", canonicalPath: "/weeks-and-months", supportPath: "/year-by-calendar", intent: "primary" },
  // Year by calendar
  { keyword: "year by calendar view", canonicalPath: "/calendar-year-view", supportPath: "/year-by-calendar", intent: "primary" },
  { keyword: "year by calendar", canonicalPath: "/year-by-calendar", supportPath: "/weeks-in-a-year", intent: "primary" },
  // Week by year
  { keyword: "week by year past and future", canonicalPath: "/week-by-year-index", supportPath: "/week-by-year", intent: "primary" },
  { keyword: "week by year index", canonicalPath: "/week-by-year-index", supportPath: "/week-by-year", intent: "primary" },
  { keyword: "week by year", canonicalPath: "/week-by-year", supportPath: "/calendar/[year]", intent: "primary" },
  // Other
  { keyword: "what year is it", canonicalPath: "/what-year-week-is-it", supportPath: "/current-week-number-canada", intent: "supporting" },
  { keyword: "what's the current week number", canonicalPath: "/current-week-number-canada", supportPath: "/what-week-of-the-year-is-it", intent: "primary" },
  { keyword: "what year week is it", canonicalPath: "/what-year-week-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "current week number", canonicalPath: "/current-week-number-canada", supportPath: "/what-week-of-the-year-is-it", intent: "primary" },
  { keyword: "week of the year", canonicalPath: "/what-week-of-the-year-is-it", supportPath: "/current-week-number-canada", intent: "primary" },
  { keyword: "what day of the week", canonicalPath: "/what-day-of-the-week", supportPath: "/what-day-of-the-year-is-it", intent: "primary" },
];

export type BodySection = {
  h2: string;
  paragraph: string;
  h3?: { heading: string; paragraph: string }[];
};

export type KeywordSnapshot = {
  today: Date;
  currentYear: number;
  canadaWeek: number;
  isoWeek: number;
  weekYear: number;
  dayOfYear: number;
  dayName: string;
  weeksInYear: number;
  weeksLeft: number;
  weekStart: Date;
  weekEnd: Date;
};

type PageContent = {
  title: (locale: Locale) => string;
  description: (locale: Locale) => string;
  h1: (locale: Locale) => string;
  intro: (locale: Locale) => string;
  faq: (locale: Locale, currentYear: number, weekNumber: number, dayOfYear: number, weekYear: number) => Array<{ question: string; answer: string }>;
  bodySections?: (locale: Locale, snap: KeywordSnapshot) => BodySection[];
};

export const keywordPages: Record<KeywordPageKey, PageContent> = {
  "what-week-is-it": {
    title: (locale) => (locale === "fr" ? "Quelle semaine sommes-nous? Réponse en direct" : "What Week Is It? Live Answer for Canada"),
    description: (locale) =>
      locale === "fr"
        ? "Quelle semaine sommes-nous? Réponse en direct pour le Canada — semaine actuelle, dates de début et de fin, mise à jour en temps réel."
        : "What week is it? Live answer for Canada — current week number, start and end dates, updated in real time. Free, bilingual.",
    h1: (locale) => (locale === "fr" ? "Quelle semaine sommes-nous?" : "What week is it?"),
    intro: (locale) =>
      locale === "fr"
        ? "Réponse rapide pour la semaine actuelle au Canada, avec les dates de la semaine et le numéro de semaine."
        : "Quick answer for the current week in Canada, with this week's dates and the current week number.",
    faq: (locale, currentYear, weekNumber) => {
      const weeksInYear = getWeeksInIsoYear(currentYear);
      const weeksLeft = Math.max(0, weeksInYear - weekNumber);
      return [
        {
          question: locale === "fr" ? "Quelle semaine sommes-nous aujourd'hui?" : "What week is it today?",
          answer:
            locale === "fr"
              ? `Aujourd'hui, nous sommes en semaine ${weekNumber} de ${currentYear}.`
              : `Today is in week ${weekNumber} of ${currentYear}.`,
        },
        {
          question: locale === "fr" ? "Quelle est la semaine en cours?" : "What is the current week?",
          answer:
            locale === "fr"
              ? `La semaine en cours est la semaine ${weekNumber} (${currentYear}).`
              : `The current week is week ${weekNumber} (${currentYear}).`,
        },
        {
          question: locale === "fr" ? "Combien de semaines reste-t-il dans l'année?" : "How many weeks are left in the year?",
          answer:
            locale === "fr"
              ? `Il reste ${weeksLeft} semaines après la semaine ${weekNumber}.`
              : `There are ${weeksLeft} weeks left after week ${weekNumber}.`,
        },
        {
          question: locale === "fr" ? "En quelle semaine serons-nous la semaine prochaine?" : "What week will it be next week?",
          answer:
            locale === "fr"
              ? `La semaine prochaine sera la semaine ${weekNumber + 1}.`
              : `Next week will be week ${weekNumber + 1}.`,
        },
      ];
    },
    bodySections: (locale, snap) => {
      const { canadaWeek, isoWeek, currentYear, weekStart, weekEnd } = snap;
      const localeCode = locale === "fr" ? "fr-CA" : "en-CA";
      const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" };
      const startStr = new Intl.DateTimeFormat(localeCode, opts).format(weekStart);
      const endStr = new Intl.DateTimeFormat(localeCode, opts).format(weekEnd);
      if (locale === "fr") {
        return [
          {
            h2: `Cette semaine au Canada — semaine ${canadaWeek}`,
            paragraph: `C'est la semaine ${canadaWeek} de ${currentYear}. Elle commence le ${startStr} et se termine le ${endStr}. La numérotation suit le calendrier canadien (dimanche à samedi).`,
          },
          {
            h2: `Semaine ISO et semaine Canada`,
            paragraph: `Selon le système, vous verrez parfois ${isoWeek} (ISO 8601, lundi au dimanche) ou ${canadaWeek} (Canada, dimanche au samedi). Les deux numéros sont presque toujours identiques; ils peuvent décaler d'une unité autour du 1ᵉʳ janvier et du 31 décembre.`,
          },
          {
            h2: `Comment lire le numéro de semaine`,
            paragraph: `Le numéro de semaine indique la position de la semaine dans l'année. La semaine 1 contient le premier jeudi de l'année (selon ISO) ou le premier dimanche (selon Canada). Aujourd'hui, nous sommes en semaine ${canadaWeek}.`,
          },
        ];
      }
      return [
        {
          h2: `This week in Canada — week ${canadaWeek}`,
          paragraph: `It's week ${canadaWeek} of ${currentYear}. The week starts on ${startStr} and ends on ${endStr}. The numbering follows the Canadian calendar (Sunday to Saturday).`,
        },
        {
          h2: `ISO week vs. Canada week`,
          paragraph: `Depending on the system, you may see ${isoWeek} (ISO 8601, Monday to Sunday) or ${canadaWeek} (Canada, Sunday to Saturday). Both numbers are almost always identical; they can differ by one around January 1 and December 31.`,
        },
        {
          h2: `How to read the week number`,
          paragraph: `The week number simply tells you where the week sits in the year. Week 1 is the one that contains the first Thursday of the year (ISO) or the first Sunday (Canada). Today we're in week ${canadaWeek}.`,
        },
      ];
    },
  },
  "what-week-of-the-year-is-it": {
    title: (locale) => (locale === "fr" ? "Quelle semaine de l'année sommes-nous? | WhatWeek.ca" : "What Week of the Year Is It? Live for Canada"),
    description: (locale) =>
      locale === "fr"
        ? "Quelle semaine de l'année sommes-nous? Numéro de semaine en cours au Canada, semaines parcourues, semaines restantes — mis à jour en direct."
        : "What week of the year is it? Current Canada week number, weeks elapsed, weeks remaining — live, ISO and Canada Sun–Sat systems, bilingual.",
    h1: (locale) => (locale === "fr" ? "Quelle semaine de l'année sommes-nous?" : "What week of the year is it?"),
    intro: (locale) =>
      locale === "fr"
        ? "Numéro de semaine actuel dans l'année au Canada, avec le contexte ISO et le total des semaines parcourues sur l'année."
        : "Current week of the year in Canada, with ISO context, weeks elapsed so far, and weeks remaining until the end of the year.",
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
              ? `Aujourd'hui, c'est le jour ${dayOfYear} de ${currentYear}, dans la semaine ${weekNumber}.`
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
            h2: "Quelle semaine de l'année sommes-nous au Canada en ce moment?",
            paragraph: `Le Canada est actuellement en semaine ${canadaWeek} de ${currentYear}. La même date peut donner deux numéros différents selon le système choisi : ISO 8601 (lundi–dimanche) est la norme internationale, tandis que les calendriers de paie, scolaires et d'entreprise au Canada utilisent souvent dimanche–samedi.`,
          },
          {
            h2: "« Semaine du jour » et semaine de l'année (ISO 8601 vs dim.–sam.)",
            paragraph: `La semaine ISO ${isoWeek} et la semaine Canada ${canadaWeek} coïncident généralement, mais elles peuvent varier de 1 autour du 1ᵉʳ janvier et du 31 décembre. Choisissez le système utilisé par vos outils, puis conservez-le toute l'année. Mélanger les deux en cours d'année est la cause la plus fréquente d'erreurs de paie, de planification et de rapports.`,
          },
          {
            h2: "Combien de semaines avons-nous parcourues dans l'année?",
            paragraph: `Nous sommes à ${canadaWeek} semaines dans ${currentYear}. Compter les semaines écoulées aide à suivre les bilans trimestriels, l'avancement des projets et les sessions scolaires. Le calcul correspond simplement au numéro de semaine actuel selon le système choisi.`,
          },
          {
            h2: "Combien de semaines reste-t-il dans l'année?",
            paragraph: `${currentYear} contient ${weeksInYear} semaines ISO, ce qui laisse ${weeksLeft} semaines après la semaine ${canadaWeek}. Pratique pour fixer les échéances de fin de trimestre, planifier le prochain long week-end et budgéter les jours de congé restants. Certaines années se terminent à la semaine 53 plutôt que 52 — vérifiez avant de conclure.`,
          },
          {
            h2: "Quel jour de l'année sommes-nous?",
            paragraph: `Aujourd'hui, c'est le jour ${dayOfYear} de ${currentYear}, en semaine ${canadaWeek}. Le jour de l'année (aussi appelé jour ordinal ou jour julien) va de 1 le 1ᵉʳ janvier à 365 ou 366 le 31 décembre. Il complète le numéro de semaine pour suivre des objectifs au jour près.`,
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
        ? "Année-semaine courante et numéro de semaine au Canada, pour aligner vos opérations et rapports."
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
    bodySections: (locale, snap) => {
      const { currentYear } = snap;
      const weeksInYear = getWeeksInIsoYear(currentYear);
      const daysInYear = new Date(currentYear, 11, 31).getDate();
      const extraDays = 365 - 7 * 52;
      if (locale === "fr") {
        return [
          { h2: `Combien de semaines en ${currentYear}?`, paragraph: `${currentYear} contient ${weeksInYear} semaines ISO. La plupart des années en ont 52, mais certaines en ont 53 en raison de la façon dont ISO 8601 aligne les semaines avec les jours de la semaine.` },
          { h2: "52 semaines et jours supplémentaires", paragraph: `52 semaines = 7 jours × 364 jours, soit une année normale de 365 jours moins 1 jour supplémentaire. Une année bissextile de 366 jours a 2 jours supplémentaires. Ces jours supplémentaires expliquent pourquoi le numéro de semaine et la date du calendrier peuvent décaler d'une année à l'autre.` },
          { h2: "Années à 53 semaines ISO", paragraph: `Une année ISO contient 53 semaines lorsque son premier jeudi tombe le 1ᵉʳ janvier (en année normale) ou les 1ᵉʳ ou 2 janvier (en année bissextile). Exemples récents et à venir : 2009, 2015, 2020, 2026, 2032. Planifiez à l'avance pour la paie hebdomadaire ou les calendriers de rapports qui suivent ISO.` },
          { h2: `Jours fériés au Canada en ${currentYear}`, paragraph: `Le nombre de jours fériés varie selon la province et le territoire. Consultez les pages fériées de chaque province pour voir combien de congés sont observés en ${currentYear}.` },
        ];
      }
      return [
        { h2: `How many weeks are in ${currentYear}?`, paragraph: `${currentYear} contains ${weeksInYear} ISO weeks. Most years have 52, but some have 53 due to how ISO 8601 aligns weeks with weekdays.` },
        { h2: "52 weeks and the extra days", paragraph: `52 weeks = 7 days × 364 days, which is a normal 365-day year minus 1 extra day. A 366-day leap year has 2 extra days. These extra days are why the week number, calendar date, and day-of-year drift relative to each other from year to year.` },
        { h2: "Years with 53 ISO weeks", paragraph: `An ISO year contains 53 weeks when its first Thursday falls on January 1 (in a regular year) or on January 1 or 2 (in a leap year). Recent and upcoming 53-week ISO years: 2009, 2015, 2020, 2026, 2032. Plan ahead for weekly payroll or reporting calendars that follow ISO standards.` },
        { h2: `Canadian statutory holidays in ${currentYear}`, paragraph: `The number of statutory holidays varies by province and territory. Check each province's holiday page to see how many days off are observed in ${currentYear}.` },
      ];
    },
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
        ? "Le numéro du jour dans l'année — utile pour le suivi d'objectifs, la production et les échéanciers."
        : "Shows the day number in the current year, useful for goal tracking, production plans, and annual timelines.",
    faq: (locale, currentYear, weekNumber, dayOfYear) => [
      {
        question: locale === "fr" ? "Quel jour de l'année sommes-nous aujourd'hui?" : "What day of the year is today?",
        answer: locale === "fr" ? `Aujourd'hui, c'est le jour ${dayOfYear} de ${currentYear}.` : `Today is day ${dayOfYear} of ${currentYear}.`,
      },
      {
        question: locale === "fr" ? "Ce jour correspond à quelle semaine?" : "Which week does this day fall in?",
        answer: locale === "fr" ? `Ce jour fait partie de la semaine ${weekNumber}.` : `This day falls in week ${weekNumber}.`,
      },
    ],
    bodySections: (locale, snap) => {
      const { currentYear, dayOfYear, canadaWeek, dayName, weeksInYear } = snap;
      const daysLeft = (new Date(currentYear, 11, 31).getDate()) - dayOfYear;
      if (locale === "fr") {
        return [
          { h2: `Quel jour de l'année sommes-nous? — Jour ${dayOfYear} sur 365`, paragraph: `Aujourd'hui, c'est le jour ${dayOfYear} de ${currentYear}, dans la semaine Canada ${canadaWeek}. Le jour de l'année (aussi appelé jour ordinal ou jour julien) va de 1 le 1ᵉʳ janvier à 365 — ou 366 lors d'une année bissextile — le 31 décembre.` },
          { h2: "Jour de l'année et jour de la semaine", paragraph: `Le jour de l'année indique où vous en êtes dans l'année, tandis que le « ${dayName} » indique quel jour de la semaine nous sommes aujourd'hui. Ensemble, ils permettent de retrouver n'importe quelle date sans calendrier — pratique pour les ingénieurs, les planificateurs et toute personne qui aligne des cadences hebdomadaires sur des objectifs annuels.` },
          { h2: `Progression annuelle : ${dayOfYear} sur 365, ${Math.round((dayOfYear / (new Date(currentYear, 11, 31).getDate())) * 100)}%`, paragraph: `${currentYear} contient ${weeksInYear} semaines ISO. Nous sommes à ${Math.round((dayOfYear / (new Date(currentYear, 11, 31).getDate())) * 100)}% de l'année. Il reste ${daysLeft} jours — utile pour suivre les bilans trimestriels, les plans de production et les échéanciers.` },
          { h2: "Jour ordinal et jour julien", paragraph: "Le jour ordinal correspond au nombre de jours depuis le 1ᵉʳ janvier. Le 1ᵉʳ janvier = jour 1, le 31 janvier = jour 31, et ainsi de suite. Il complète le numéro de semaine pour suivre des objectifs annuels au jour près." },
        ];
      }
      return [
        { h2: `What day of the year is it? — Day ${dayOfYear} of 365`, paragraph: `Today is day ${dayOfYear} of ${currentYear}, inside Canada week ${canadaWeek}. The day-of-year (ordinal day, Julian day, DOY) runs 1 on January 1 to 365 or 366 on December 31.` },
        { h2: "Day of the year and day of the week", paragraph: `Day-of-year tells you where you are in the year; the "${dayName}" tells you which weekday today is. Together they let you reconstruct any date without a calendar — useful for engineers, schedulers, and anyone aligning weekly cadences to annual milestones.` },
        { h2: `Annual progress: day ${dayOfYear} of ${new Date(currentYear, 11, 31).getDate()}, ${Math.round((dayOfYear / (new Date(currentYear, 11, 31).getDate())) * 100)}%`, paragraph: `${currentYear} has ${weeksInYear} ISO weeks. We are ${Math.round((dayOfYear / (new Date(currentYear, 11, 31).getDate())) * 100)}% through the year, with ${daysLeft} days remaining. Useful for OKR check-ins, production plans, and annual timelines.` },
        { h2: "Ordinal day and Julian day", paragraph: "The ordinal day (DOY) is the number of days since January 1. January 1 = day 1, January 31 = day 31, etc. It complements the week number for tracking annualized goals at daily granularity — engineering, science, agriculture, long-running projects." },
      ];
    },
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
  "week-dates-and-iso-number": {
    title: (locale) => (locale === "fr" ? "Dates de la semaine ISO et numéro de semaine" : "Week Dates and ISO Week Number"),
    description: (locale) =>
      locale === "fr"
        ? "Consultez les dates de début et de fin de la semaine ISO actuelle, le numéro de semaine et le contexte Canada."
        : "See the start and end dates of the current ISO week, the week number, and Canada context — updated live.",
    h1: (locale) => (locale === "fr" ? "Dates de la semaine et numéro ISO" : "Week Dates and ISO Week Number"),
    intro: (locale) =>
      locale === "fr"
        ? "Voici les dates de la semaine ISO actuelle : lundi au dimanche avec les numéros Canada et ISO 8601."
        : "Here are the start and end dates of the current ISO week, with both Canada and ISO 8601 week numbers.",
    faq: (locale, currentYear, weekNumber, dayOfYear) => [
      {
        question: locale === "fr" ? "Quelle est la date de début de la semaine ISO?" : "What is the start date of the ISO week?",
        answer:
          locale === "fr"
            ? `La semaine ISO ${weekNumber} commence le lundi de la semaine ${weekNumber} en ${currentYear}.`
            : `ISO week ${weekNumber} starts on Monday of week ${weekNumber} in ${currentYear}.`,
      },
      {
        question: locale === "fr" ? "Quelle est la date de fin de la semaine ISO?" : "What is the end date of the ISO week?",
        answer:
          locale === "fr"
            ? `La semaine ISO ${weekNumber} se termine le dimanche suivant, soit la fin de la semaine.`
            : `ISO week ${weekNumber} ends on the following Sunday, which is the end of that week.`,
      },
      {
        question: locale === "fr" ? "Quel jour sommes-nous dans l'année?" : "What day of the year is it?",
        answer: locale === "fr" ? `Nous sommes le jour ${dayOfYear} de ${currentYear}.` : `It is day ${dayOfYear} of ${currentYear}.`,
      },
    ],
    bodySections: (locale, snap) => {
      const { isoWeek, currentYear, canadaWeek, weekStart, weekEnd, weeksInYear } = snap;
      const localeCode = locale === "fr" ? "fr-CA" : "en-CA";
      const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" };
      const isoStart = new Intl.DateTimeFormat(localeCode, opts).format(weekStart);
      const isoEnd = new Intl.DateTimeFormat(localeCode, opts).format(weekEnd);
      if (locale === "fr") {
        return [
          { h2: "Semaine actuelle — dates ISO et Canada", paragraph: `Nous sommes à la semaine ISO ${isoWeek} en ${currentYear}. La semaine ISO ${isoWeek} va du lundi ${isoStart} au dimanche ${isoEnd}. Au Canada, avec le système dim.–sam., nous sommes à la semaine Canada ${canadaWeek}.` },
          { h2: "Différence entre ISO 8601 et Canada (dim.–sam.)", paragraph: "Les deux systèmes coïncident la plupart du temps, mais peuvent différer de 1 autour du 1ᵉʳ janvier et du 31 décembre. ISO 8601 commence le lundi, tandis que le système Canada commence le dimanche. Choisissez le système utilisé par vos outils de paie ou d'école." },
          { h2: `Semaines parcourues dans l'année — ${canadaWeek} sur ${weeksInYear}`, paragraph: `Nous sommes à ${canadaWeek} semaines dans ${currentYear}, avec ${Math.max(0, weeksInYear - canadaWeek)} semaines restantes. Ce nombre aide à suivre les bilans trimestriels, l'avancement des projets et la planification scolaire.` },
        ];
      }
      return [
        { h2: "Current week — ISO and Canada dates", paragraph: `We are in ISO week ${isoWeek} of ${currentYear}. ISO week ${isoWeek} runs from Monday ${isoStart} through Sunday ${isoEnd}. Under Canada's Sun–Sat system, we are in Canada week ${canadaWeek}.` },
        { h2: "ISO 8601 vs. Canada (Sun–Sat) week systems", paragraph: "Both systems usually match, but can differ by 1 around January 1 and December 31. ISO 8601 starts on Monday; Canada's system starts on Sunday. Pick whichever standard your payroll or school tools use and stick with it all year." },
        { h2: `Weeks into the year — ${canadaWeek} of ${weeksInYear}`, paragraph: `We are ${canadaWeek} weeks into ${currentYear}, with ${Math.max(0, weeksInYear - canadaWeek)} weeks remaining. This is useful for OKR check-ins, project burn-down, and school-term progress tracking.` },
      ];
    },
  },
  "weeks-into-the-year": {
    title: (locale) => (locale === "fr" ? "Combien de semaines se sont écoulées dans l'année?" : "Weeks into the Year So Far — Live Counter"),
    description: (locale) =>
      locale === "fr"
        ? "Combien de semaines se sont écoulées dans l'année? Compteur live avec contexte Canada et ISO — semaines écoulées et restantes."
        : "How many weeks have passed so far this year? Live counter with Canada and ISO week context. See weeks elapsed and remaining.",
    h1: (locale) => (locale === "fr" ? "Combien de semaines dans l'année?" : "Weeks into the Year So Far"),
    intro: (locale) =>
      locale === "fr"
        ? "Voici le nombre de semaines parcourues dans l'année en cours, avec le contexte Canada et ISO."
        : "Here is how many weeks have passed in the current year, with Canada and ISO week context.",
    faq: (locale, currentYear, weekNumber) => {
      const weeksInYear = getWeeksInIsoYear(currentYear);
      const weeksLeft = Math.max(0, weeksInYear - weekNumber);
      return [
        {
          question: locale === "fr" ? "Combien de semaines se sont écoulées?" : "How many weeks into the year are we?",
          answer:
            locale === "fr"
              ? `Nous sommes à ${weekNumber} semaines écoulées sur ${weeksInYear} en ${currentYear}.`
              : `We are ${weekNumber} weeks into ${currentYear}, out of ${weeksInYear} total.`,
        },
        {
          question: locale === "fr" ? "Combien de semaines reste-t-il?" : "How many weeks of the year are left?",
          answer:
            locale === "fr"
              ? `Il reste ${weeksLeft} semaines en ${currentYear} après la semaine ${weekNumber}.`
              : `There are ${weeksLeft} weeks left in ${currentYear} after week ${weekNumber}.`,
        },
        {
          question: locale === "fr" ? "Comment calculer les semaines écoulées?" : "How do you calculate weeks into the year?",
          answer:
            locale === "fr"
              ? "On utilise le numéro de semaine actuel selon ISO 8601 (lundi–dimanche) ou Canada (dimanche–samedi)."
              : "You use the current ISO 8601 (Mon–Sun) or Canada (Sun–Sat) week number to track elapsed weeks.",
        },
      ];
    },
  },
  "what-week-number": {
    title: (locale) => (locale === "fr" ? "Quel est le numéro de semaine?" : "What Week Number Is It?"),
    description: (locale) =>
      locale === "fr"
        ? "Quel est le numéro de semaine actuel? Réponse instantanée en Canada et ISO 8601, mis à jour en direct."
        : "What week number is it right now? Instant answer in ISO 8601 and Canada week systems, updated live every second.",
    h1: (locale) => (locale === "fr" ? "Quel est le numéro de semaine?" : "What week number is it?"),
    intro: (locale) =>
      locale === "fr"
        ? "Le numéro de semaine actuel est calculé en direct selon le fuseau horaire canadien."
        : "The current week number is calculated live using a Canada time zone — updated every second.",
    faq: (locale, currentYear, weekNumber) => [
      {
        question: locale === "fr" ? "Quel est le numéro de semaine actuel?" : "What is the current week number?",
        answer: locale === "fr" ? `Nous sommes à la semaine ${weekNumber} en ${currentYear}.` : `We are in week ${weekNumber} of ${currentYear}.`,
      },
      {
        question: locale === "fr" ? "La semaine ISO et Canada sont-elles identiques?" : "Are ISO week and Canada week the same?",
        answer:
          locale === "fr"
            ? "La plupart du temps, oui. Elles peuvent différer de 1 autour du 1ᵉʳ janvier et du 31 décembre."
            : "Most of the time they match. They can differ by 1 around January 1 and December 31.",
      },
    ],
  },
  "day-of-year-and-weekday": {
    title: (locale) => (locale === "fr" ? "Jour de l'année et jour de la semaine" : "Day of the Year and Day of the Week"),
    description: (locale) =>
      locale === "fr"
        ? "Quel jour de l'année sommes-nous et quel jour de la semaine? Contexte Canada et ISO mis à jour en direct."
        : "What day of the year is it and what day of the week? Live Canada and ISO context with week and month alignment.",
    h1: (locale) => (locale === "fr" ? "Jour de l'année et jour de la semaine" : "Day of the Year and Day of the Week"),
    intro: (locale) =>
      locale === "fr"
        ? "Le jour de l'année et le jour de la semaine en temps réel, avec le numéro de semaine Canada."
        : "Shows the current day of the year and day of the week in real time, with the Canada week number.",
    faq: (locale, currentYear, _w, dayOfYear) => [
      {
        question: locale === "fr" ? "Quel jour de l'année sommes-nous aujourd'hui?" : "What day of the year is today?",
        answer: locale === "fr" ? `Nous sommes au jour ${dayOfYear} de ${currentYear}.` : `Today is day ${dayOfYear} of ${currentYear}.`,
      },
      {
        question: locale === "fr" ? "Combien de jours dans l'année?" : "How many days are in a year?",
        answer:
          locale === "fr"
            ? `${currentYear} a 365 jours, ou 366 les années bissextiles. Jour ${dayOfYear} sur ${new Date(currentYear, 11, 31).getDate()}.`
            : `${currentYear} has 365 days, or 366 in a leap year. Day ${dayOfYear} of ${new Date(currentYear, 11, 31).getDate()}.`,
      },
    ],
  },
  "weeks-and-months-calendar": {
    title: (locale) => (locale === "fr" ? "Semaines et mois dans le calendrier" : "Weeks and Months in the Calendar"),
    description: (locale) =>
      locale === "fr"
        ? "Comprenez comment les semaines ISO s'alignent avec les mois canadiens pour la paie, l'école et les opérations."
        : "Understand how ISO weeks align with Canadian calendar months for payroll, school terms, and operations. Live reference.",
    h1: (locale) => (locale === "fr" ? "Semaines et mois dans le calendrier" : "Weeks and Months in the Calendar"),
    intro: (locale) =>
      locale === "fr"
        ? "Un mois contient généralement 4 à 5 semaines. Voici comment les numéros de semaine ISO s'alignent avec les mois."
        : "A month typically spans 4 to 5 weeks. Here is how ISO week numbers align with calendar months for planning.",
    faq: (locale, currentYear) => [
      {
        question: locale === "fr" ? "Combien de semaines par mois?" : "How many weeks per month?",
        answer:
          locale === "fr"
            ? "Un mois contient 4 à 5 semaines selon son emplacement. La plupart en ont 4 complètes et une partie de la 5ᵉ."
            : "A month spans 4 to 5 weeks depending on where it falls. Most months have 4 full weeks plus part of a 5th.",
      },
      {
        question: locale === "fr" ? "Peut-on utiliser les semaines ISO pour la paie?" : "Can you use ISO weeks for payroll?",
        answer:
          locale === "fr"
            ? "Oui, ISO 8601 (lundi-dimanche) est recommandé pour la paie internationale et la planification."
            : "Yes, ISO 8601 (Mon–Sun) is recommended for international payroll and scheduling.",
      },
    ],
  },
  "calendar-year-view": {
    title: (locale) => (locale === "fr" ? "Calendrier annuel avec numéros de semaine" : "Calendar Year View with Week Numbers"),
    description: (locale) =>
      locale === "fr"
        ? "Naviguez dans le calendrier annuel avec les numéros de semaine Canada et ISO — années passées et futures."
        : "Browse the year calendar with Canada and ISO week numbers — past and future years. Live Canada-centric view.",
    h1: (locale) => (locale === "fr" ? "Calendrier annuel avec semaines" : "Calendar Year View"),
    intro: (locale) =>
      locale === "fr"
        ? "Naviguez dans les calendriers annuels avec les numéros de semaine Canada et ISO pour planifier paie et congés."
        : "Browse year calendars with Canada and ISO week numbers to plan payroll, school terms, and holidays.",
    faq: (locale, currentYear) => [
      {
        question: locale === "fr" ? `Comment fonctionne le calendrier ${currentYear}?` : `How does the ${currentYear} calendar work?`,
        answer:
          locale === "fr"
            ? `Le calendrier ${currentYear} affiche les numéros de semaine Canada et ISO pour chaque jour de l'année.`
            : `The ${currentYear} calendar shows Canada and ISO week numbers for each day of the year.`,
      },
      {
        question: locale === "fr" ? "Quelles années sont disponibles?" : "Which years are available?",
        answer:
          locale === "fr"
            ? "De 1900 à 2100 — vous pouvez naviguer vers n'importe quelle année depuis ce calendrier."
            : "From 1900 to 2100 — you can navigate to any year from this calendar.",
      },
    ],
  },
  "week-by-year-index": {
    title: (locale) => (locale === "fr" ? "Semaine par année — Index" : "Week by Year: Past and Future Weeks"),
    description: (locale) =>
      locale === "fr"
        ? "Index semaine par année : trouvez n'importe quelle semaine passée ou future, avec dates et contexte férié."
        : "Week by year index: find any past or future week with dates, holidays, and long-weekend context. Live navigation.",
    h1: (locale) => (locale === "fr" ? "Semaine par année" : "Week by Year: Past and Future Weeks"),
    intro: (locale) =>
      locale === "fr"
        ? "Naviguez vers n'importe quelle semaine passée ou future, avec le contexte jour, semaine, mois et férié."
        : "Navigate to any past or future week with day, week, month, and holiday context. Updated live every second.",
    faq: (locale, currentYear, weekNumber) => [
      {
        question: locale === "fr" ? "Peut-on voir les semaines passées?" : "Can I see past weeks?",
        answer:
          locale === "fr"
            ? `Oui, ouvrez le calendrier ${currentYear} et sélectionnez la semaine voulue — toutes les dates sont disponibles.`
            : `Yes, navigate to ${currentYear} and select the week you need — all past dates are available.`,
      },
      {
        question: locale === "fr" ? `La semaine ${weekNumber} contient-elle des jours fériés?` : `Does week ${weekNumber} have holidays?`,
        answer:
          locale === "fr"
            ? "La page de détail de chaque semaine liste tous les jours fériés canadiens pour cette semaine."
            : "Each week detail page lists all Canadian statutory holidays that fall within that week.",
      },
    ],
  },
};

export const keywordPageOrder: KeywordPageKey[] = [
  "what-week-is-it",
  "what-week-of-the-year-is-it",
  "what-year-week-is-it",
  "weeks-in-a-year",
  "what-day-of-the-year-is-it",
  "what-day-of-the-week",
  "weeks-and-months",
  "year-by-calendar",
  "week-by-year",
  "week-dates-and-iso-number",
  "weeks-into-the-year",
  "what-week-number",
  "day-of-year-and-weekday",
  "weeks-and-months-calendar",
  "calendar-year-view",
  "week-by-year-index",
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
  const weekStart = startOfIsoWeek(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  return { today, currentYear, canadaWeek, isoWeek, weekYear, dayOfYear, dayName, weeksInYear, weeksLeft, weekStart, weekEnd };
}
