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
  headerTagline: string;
  /** Homepage `<title>` / Open Graph title (keep ~30–65 chars for SERP). */
  metadataHomeTitle: string;
  home: {
    h1: string;
    heroAnswer: (week: number, year: number) => string;
    heroSupporting: string;
    intro: { line1: string; line2: string; line3: string };
    weekOfYear: {
      h2: string;
      body: (week: number, year: number, range: string) => string;
      h3WeekDates: { heading: string; body: (range: string) => string };
      h3WeeksIntoYear: { heading: string; body: (week: number, weeksLeft: number, year: number) => string };
    };
    weeksInYear: {
      h2: string;
      body: (year: number, weeksInYear: number) => string;
      h3ExtraDays: { heading: string; body: string };
      h353Weeks: { heading: string; body: string };
    };
    dayOfYear: {
      h2: string;
      body: (dayOfYear: number, year: number, week: number) => string;
      h3DayOfWeek: { heading: string; body: (dayName: string) => string };
    };
    weeksMonths: {
      h2: string;
      body: (year: number) => string;
      h3YearByCalendar: { heading: string; body: string };
      h3WeekByYear: { heading: string; body: string };
    };
  };
  faq: {
    heading: string;
    entries: (
      week: number,
      weeksInYear: number,
      year: number,
      dayOfYear: number,
      weekYear: number,
    ) => Array<{ q: string; a: string }>;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    brand: "whatweek.ca",
    title: (province) => province ? `Calendar with week numbers for ${province}` : "Calendar with week numbers for Canada",
    headerTagline:
      "See what week of the year it is right now in Canada, including the current week number and the dates this week starts and ends.",
    metadataHomeTitle: "Current Week Number Canada | WhatWeek.ca",
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
    home: {
      h1: "What Week of the Year Is It?",
      heroAnswer: (week, year) => `It’s week ${week} of ${year} in Canada.`,
      heroSupporting:
        "Current week number, week dates, day of the year and weeks into the year — updated live.",
      intro: {
        line1:
          "See what week of the year it is right now in Canada, including the current week number and the dates this week starts and ends.",
        line2: "WhatWeek.ca also shows what day of the year it is today and how many weeks into the year we are.",
        line3: "Everything updates live, so you always get the right answer for this week.",
      },
      weekOfYear: {
        h2: "What Week of the Year Is It This Week?",
        body: (week, year, range) =>
          `This week is week ${week} of ${year}, running from ${range}. The number you see is the current week of the year for Canada, computed live from a Canadian time zone—so it always reflects today, with no manual refresh.`,
        h3WeekDates: {
          heading: "Week Dates and ISO Week Number",
          body: (range) =>
            `The current week runs from ${range}. Under ISO 8601 (Monday–Sunday) and the Canadian Sunday–Saturday system, the week number can sometimes differ by 1 around January 1 and December 31—use the system toggle above to compare.`,
        },
        h3WeeksIntoYear: {
          heading: "Weeks into the Year So Far",
          body: (week, weeksLeft, year) =>
            `We are ${week} weeks into ${year}, with ${weeksLeft} weeks of the year still ahead. Many teams use this as a quarter or annual progress check, and it doubles as the count of completed weeks for OKR and content-calendar planning.`,
        },
      },
      weeksInYear: {
        h2: "How Many Weeks Are in a Year?",
        body: (year, weeksInYear) =>
          `Most years contain exactly 52 weeks. Under ISO 8601, a year occasionally holds 53 weeks because of how it aligns with weekdays. ${year} has ${weeksInYear} ISO weeks. The total is the same across every Canadian province and territory—what varies are the statutory holidays inside those weeks.`,
        h3ExtraDays: {
          heading: "Weeks of the Year and Extra Days",
          body:
            "52 weeks × 7 days = 364 days, so a normal 365-day year always has 1 'extra' day, and a 366-day leap year has 2. Those extra days are why the day-of-year, the calendar date, and the week number drift relative to each other from one year to the next.",
        },
        h353Weeks: {
          heading: "Years with 53 Weeks",
          body:
            "An ISO year contains 53 weeks when its first Thursday falls on January 1 (or, in a leap year, on January 1 or 2). Recent and upcoming 53-week ISO years include 2009, 2015, 2020, 2026, and 2032—useful to plan for if your weekly payroll or reporting calendar follows ISO.",
        },
      },
      dayOfYear: {
        h2: "What Day of the Year Is It?",
        body: (dayOfYear, year, week) =>
          `Today is day ${dayOfYear} of ${year}, which falls inside week ${week}. The day-of-year (also called the ordinal day, Julian day, or DOY) runs from 1 on January 1 to 365 or 366 on December 31. It's a quick way to track annual goals, project burn-down, and any plan that runs across the whole calendar year.`,
        h3DayOfWeek: {
          heading: "Day of the Year and Day of the Week",
          body: (dayName) =>
            `Day-of-year tells you how far through the year you are; day-of-week tells you which weekday today is (${dayName}). Together they let you reconstruct any date in the year without a calendar—useful for engineers, schedulers, and anyone aligning weekly cadences to annual milestones.`,
        },
      },
      weeksMonths: {
        h2: "Weeks and Months in the Calendar",
        body: (year) =>
          `WhatWeek.ca lays out every month of ${year} alongside its week numbers, so you can see at a glance how Canadian weeks and months overlap. A single ISO week often spans two months, which is why payroll, billing, and content calendars usually pick one system—Canada (Sun–Sat) or ISO 8601 (Mon–Sun)—and stick with it for the whole year.`,
        h3YearByCalendar: {
          heading: "Year by Calendar View",
          body:
            "Open any year's calendar to see all 12 months in a single grid with week numbers down the side—handy for printing a planner, comparing two years, or checking which weeks contain Canadian statutory holidays.",
        },
        h3WeekByYear: {
          heading: "Week by Year: Past and Future Weeks",
          body:
            "Browse week-by-year indexes to jump straight to a specific week (e.g. week 27 of 2027), compare equivalent weeks across multiple years, or check 53-week ISO years before locking in payroll cycles.",
        },
      },
    },
    faq: {
      heading: "Frequently asked questions about week numbers",
      entries: (week, weeksInYear, year, dayOfYear, weekYear) => {
        const weeksLeft = Math.max(0, weeksInYear - week);
        const weekPadded = String(week).padStart(2, "0");
        return [
          {
            q: "What week of the year is it right now?",
            a: `Right now we are in week ${week} of ${year} in Canada (Sun–Sat). The matching ISO 8601 week number is the same most weeks but can differ near year-end.`,
          },
          {
            q: "What week is it this week?",
            a: `This week is week ${week} of ${year}. Use the system toggle above to switch between Canada (Sunday to Saturday) and ISO 8601 (Monday to Sunday).`,
          },
          {
            q: "What's the current week number?",
            a: `The current week number is ${week}. It updates automatically based on a Canadian time zone, so you always see today's value—no manual refresh required.`,
          },
          {
            q: "How many weeks are in a year?",
            a: `Most years have 52 weeks. Some ISO years contain 53 weeks; ${year} has ${weeksInYear}. The number is the same across every Canadian province and territory.`,
          },
          {
            q: "How many weeks into the year are we?",
            a: `We are ${week} weeks into ${year}, with ${weeksLeft} weeks of the year remaining.`,
          },
          {
            q: "What day of the year is it today?",
            a: `Today is day ${dayOfYear} of ${year}. It falls inside week ${week}—useful for tracking annual goals, project timelines, and Julian-day references.`,
          },
          {
            q: "What year week is it?",
            a: `The current ISO week-year is ${weekYear}-W${weekPadded}. The week-year can differ from the calendar year for a few days each January and December.`,
          },
          {
            q: "Does the week number change by province?",
            a: "No—the week number is the same across all of Canada. Holidays and long weekends, however, vary by province.",
          },
        ];
      },
    },
  },
  fr: {
    brand: "whatweek.ca",
    title: (province) => province ? `Calendrier avec numéro de semaine pour ${province}` : "Calendrier avec numéro de semaine pour le Canada",
    headerTagline:
      "Voyez en direct quelle semaine de l’année nous sommes au Canada, avec le numéro de semaine actuel et les dates de début et de fin de la semaine.",
    metadataHomeTitle: "Numéro de semaine actuel Canada | WhatWeek.ca",
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
    home: {
      h1: "Quelle semaine de l'année sommes-nous ?",
      heroAnswer: (week, year) => `Nous sommes à la semaine ${week} de ${year} au Canada.`,
      heroSupporting:
        "Numéro de semaine actuel, dates de la semaine, jour de l’année et semaines parcourues — mis à jour en direct.",
      intro: {
        line1:
          "Voyez en direct quelle semaine de l'année nous sommes au Canada, avec le numéro de semaine actuel et les dates de début et de fin de la semaine.",
        line2: "WhatWeek.ca affiche aussi le jour de l'année courant et le nombre de semaines parcourues depuis le 1ᵉʳ janvier.",
        line3: "Tout se met à jour en temps réel : la réponse correspond toujours à cette semaine.",
      },
      weekOfYear: {
        h2: "Quelle semaine de l'année sommes-nous cette semaine ?",
        body: (week, year, range) =>
          `Cette semaine est la semaine ${week} de ${year}, du ${range}. Le numéro affiché correspond à la semaine de l'année pour le Canada, calculée en direct selon un fuseau horaire canadien : c'est toujours la valeur du jour, sans rafraîchissement manuel.`,
        h3WeekDates: {
          heading: "Dates de la semaine et numéro ISO",
          body: (range) =>
            `La semaine actuelle court du ${range}. Selon ISO 8601 (lundi–dimanche) et le système Canada (dimanche–samedi), le numéro de semaine peut différer de 1 autour du 1ᵉʳ janvier et du 31 décembre—utilisez le sélecteur ci-dessus pour comparer.`,
        },
        h3WeeksIntoYear: {
          heading: "Semaines parcourues dans l'année",
          body: (week, weeksLeft, year) =>
            `Nous sommes à ${week} semaines dans ${year}, avec ${weeksLeft} semaines encore devant nous. C'est un indicateur pratique de fin de trimestre ou d'avancement annuel, et c'est aussi le compte de semaines complètes pour planifier OKR et calendriers de contenu.`,
        },
      },
      weeksInYear: {
        h2: "Combien de semaines compte une année ?",
        body: (year, weeksInYear) =>
          `La plupart des années contiennent exactement 52 semaines. Selon ISO 8601, une année peut occasionnellement en contenir 53 selon l'alignement des jours. ${year} compte ${weeksInYear} semaines ISO. Ce total est identique dans toutes les provinces et tous les territoires du Canada—ce qui change, ce sont les jours fériés à l'intérieur de ces semaines.`,
        h3ExtraDays: {
          heading: "Semaines de l'année et jours en surplus",
          body:
            "52 semaines × 7 jours = 364 jours, donc une année normale de 365 jours laisse toujours 1 jour « en surplus », et une année bissextile de 366 jours en laisse 2. Ces jours additionnels expliquent pourquoi le numéro de jour, la date civile et le numéro de semaine ne s'alignent pas d'une année à l'autre.",
        },
        h353Weeks: {
          heading: "Années à 53 semaines",
          body:
            "Une année ISO contient 53 semaines lorsque son premier jeudi tombe le 1ᵉʳ janvier (ou, en année bissextile, le 1ᵉʳ ou le 2 janvier). Les années ISO récentes ou à venir avec 53 semaines incluent 2009, 2015, 2020, 2026 et 2032—à prévoir si votre paie hebdomadaire ou votre calendrier de reporting suit la norme ISO.",
        },
      },
      dayOfYear: {
        h2: "Quel jour de l'année sommes-nous ?",
        body: (dayOfYear, year, week) =>
          `Aujourd'hui est le jour ${dayOfYear} de ${year}, dans la semaine ${week}. Le jour de l'année (jour ordinal, jour julien ou DOY) va de 1 au 1ᵉʳ janvier à 365 ou 366 au 31 décembre. C'est une manière rapide de suivre les objectifs annuels, l'avancement des projets et tout plan qui s'étend sur l'ensemble de l'année.`,
        h3DayOfWeek: {
          heading: "Jour de l'année et jour de la semaine",
          body: (dayName) =>
            `Le jour de l'année indique où vous en êtes dans l'année ; le jour de la semaine vous dit quel jour c'est (${dayName}). Ensemble, ils permettent de retrouver n'importe quelle date sans calendrier—pratique pour les ingénieurs, les ordonnanceurs et toute personne qui aligne un rythme hebdomadaire avec des jalons annuels.`,
        },
      },
      weeksMonths: {
        h2: "Semaines et mois dans le calendrier",
        body: (year) =>
          `WhatWeek.ca affiche chaque mois de ${year} avec ses numéros de semaine pour visualiser d'un coup d'œil le chevauchement entre semaines et mois au Canada. Une même semaine ISO traverse souvent deux mois, c'est pourquoi la paie, la facturation et les calendriers éditoriaux choisissent un seul système—Canada (dim.–sam.) ou ISO 8601 (lun.–dim.)—pour toute l'année.`,
        h3YearByCalendar: {
          heading: "Vue année par calendrier",
          body:
            "Ouvrez le calendrier d'une année pour voir les 12 mois sur une seule grille, avec les numéros de semaine sur le côté—pratique pour imprimer un agenda, comparer deux années ou repérer les semaines contenant un jour férié canadien.",
        },
        h3WeekByYear: {
          heading: "Semaine par année : passées et à venir",
          body:
            "Parcourez les index semaine-par-année pour aller directement à une semaine précise (par ex. semaine 27 de 2027), comparer la même semaine sur plusieurs années, ou repérer les années ISO à 53 semaines avant de fixer un cycle de paie.",
        },
      },
    },
    faq: {
      heading: "Questions fréquentes sur les numéros de semaine",
      entries: (week, weeksInYear, year, dayOfYear, weekYear) => {
        const weeksLeft = Math.max(0, weeksInYear - week);
        const weekPadded = String(week).padStart(2, "0");
        return [
          {
            q: "Quelle semaine de l'année sommes-nous en ce moment ?",
            a: `Nous sommes actuellement à la semaine ${week} de ${year} au Canada (dim.–sam.). Le numéro ISO 8601 correspondant est généralement identique, mais peut différer en fin d'année.`,
          },
          {
            q: "Quelle semaine sommes-nous cette semaine ?",
            a: `Cette semaine est la semaine ${week} de ${year}. Utilisez le sélecteur ci-dessus pour basculer entre Canada (dimanche à samedi) et ISO 8601 (lundi à dimanche).`,
          },
          {
            q: "Quel est le numéro de semaine actuel ?",
            a: `Le numéro de semaine actuel est ${week}. Il se met à jour automatiquement selon un fuseau horaire canadien, sans rafraîchissement manuel.`,
          },
          {
            q: "Combien de semaines y a-t-il dans une année ?",
            a: `La plupart des années ont 52 semaines. Certaines années ISO en comptent 53 ; ${year} en a ${weeksInYear}. Ce nombre est identique dans toutes les provinces et tous les territoires du Canada.`,
          },
          {
            q: "Combien de semaines avons-nous parcourues dans l'année ?",
            a: `Nous sommes à ${week} semaines dans ${year}, avec ${weeksLeft} semaines restantes.`,
          },
          {
            q: "Quel jour de l'année sommes-nous aujourd'hui ?",
            a: `Aujourd'hui est le jour ${dayOfYear} de ${year}. Il fait partie de la semaine ${week}—utile pour suivre les objectifs annuels, les échéances de projet et les références jour julien.`,
          },
          {
            q: "Quelle année-semaine sommes-nous ?",
            a: `L'année-semaine ISO actuelle est ${weekYear}-W${weekPadded}. Elle peut différer de l'année civile pendant quelques jours en janvier et en décembre.`,
          },
          {
            q: "Le numéro de semaine change-t-il selon la province ?",
            a: "Non—le numéro de semaine est le même partout au Canada. Les jours fériés et les longs week-ends, eux, varient selon la province.",
          },
        ];
      },
    },
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
