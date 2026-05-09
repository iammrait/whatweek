import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PayPeriodCalculator } from "@/components/PayPeriodCalculator";
import { SiteHeader } from "@/components/SiteHeader";
import { getHolidaysForYear, type Holiday } from "@/lib/holidays-ca";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { buildFaqJsonLd, buildLocaleAlternates } from "@/lib/seo-metadata";
import { getTodayInTimeZone } from "@/lib/week";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isFr = locale === "fr";
  const title = isFr
    ? "Calculatrice de périodes de paie au Canada"
    : "Canadian Pay Period Calculator";
  const description = isFr
    ? "Générez votre calendrier de paie hebdomadaire, aux 2 semaines, bimensuel ou mensuel, avec les jours fériés canadiens et les paies décalées en cas de week-end."
    : "Generate a weekly, bi-weekly, semi-monthly, or monthly pay schedule with Canadian statutory holidays and weekend shifts handled automatically.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;

  return {
    title,
    description,
    alternates: buildLocaleAlternates("/pay-period-calculator"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://whatweek.ca/${locale}/pay-period-calculator`,
      locale: isFr ? "fr_CA" : "en_CA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function holidayToDto(holiday: Holiday) {
  return {
    date: `${holiday.date.getUTCFullYear()}-${String(holiday.date.getUTCMonth() + 1).padStart(2, "0")}-${String(holiday.date.getUTCDate()).padStart(2, "0")}`,
    nameEn: holiday.nameEn,
    nameFr: holiday.nameFr,
    global: holiday.global,
    counties: holiday.counties,
  };
}

export default async function PayPeriodPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";

  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const startYear = today.getUTCFullYear();
  const yearsToFetch = [startYear - 1, startYear, startYear + 1, startYear + 2];
  const lists = await Promise.all(yearsToFetch.map((year) => getHolidaysForYear(year)));
  const holidaysByYear: Record<string, ReturnType<typeof holidayToDto>[]> = {};
  yearsToFetch.forEach((year, index) => {
    holidaysByYear[String(year)] = lists[index].map(holidayToDto);
  });

  const friday = new Date(today);
  while (friday.getUTCDay() !== 5) {
    friday.setUTCDate(friday.getUTCDate() + 1);
  }
  const defaultAnchor = friday.toISOString().slice(0, 10);

  const faq = [
    {
      question: isFr
        ? "Que se passe-t-il quand une paie tombe un jour férié ?"
        : "What happens when payday falls on a holiday?",
      answer: isFr
        ? "Au Canada, la pratique standard est d’avancer la paie au jour ouvrable précédent. Cochez l’option pour activer ce décalage automatique."
        : "Canadian payroll practice is to shift payday to the previous business day. Toggle the checkbox to apply this automatically.",
    },
    {
      question: isFr
        ? "Quelle est la différence entre bimensuel et aux 2 semaines ?"
        : "What’s the difference between semi-monthly and bi-weekly?",
      answer: isFr
        ? "Bimensuel = 24 paies par an (par ex. le 15 et le dernier jour). Aux 2 semaines = 26 paies par an (toutes les 14 jours). La plupart des employeurs canadiens utilisent l’une ou l’autre."
        : "Semi-monthly = 24 paydays per year (e.g. 15th and end of month). Bi-weekly = 26 paydays per year (every 14 days). Most Canadian employers use one of the two.",
    },
    {
      question: isFr
        ? "Le calcul varie-t-il selon la province ?"
        : "Does the calculation vary by province?",
      answer: isFr
        ? "Oui — les jours fériés statutaires changent selon la province (Family Day, Civic Holiday, etc.). Sélectionnez votre province pour calibrer le calendrier."
        : "Yes — statutory holidays differ by province (Family Day, Civic Holiday, etc.). Pick your province to align the schedule.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(faqJsonLd) }} />
      <SiteHeader locale={locale} year={startYear} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>
            {isFr ? "Accueil" : "Home"}
          </Link>
          <span> / </span>
          <span>{isFr ? "Périodes de paie" : "Pay periods"}</span>
        </nav>
        <h1>
          {isFr ? "Calculatrice de périodes de paie au Canada" : "Canadian Pay Period Calculator"}
        </h1>
        <p className="subtle heroLead">
          {isFr
            ? "Choisissez votre première date de paie, votre fréquence et votre province pour obtenir un calendrier complet, avec décalage automatique pour les jours fériés et les week-ends."
            : "Pick your first pay date, frequency, and province to generate a full schedule, with automatic shifts when payday lands on a holiday or weekend."}
        </p>
      </section>

      <section className="panel">
        <PayPeriodCalculator
          locale={locale}
          defaultAnchor={defaultAnchor}
          defaultProvince={null}
          holidaysByYear={holidaysByYear}
        />
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Conseils pour la paie au Canada" : "Canadian payroll tips"}</h2>
        <p>
          {isFr
            ? "Au Canada, la paie est typiquement gérée selon ISO 8601 ou Sun–Sat. Pour les paies hebdomadaires/aux 2 semaines, utilisez le numéro de semaine ISO comme période de référence et conservez le même système toute l’année—mélanger ISO et Sun–Sat est la cause la plus fréquente d’erreurs de paie."
            : "Canadian payroll usually runs on ISO 8601 or Sun–Sat weeks. For weekly/bi-weekly cycles, use the ISO week number as your reference period and keep the same system all year—mixing ISO and Sun–Sat mid-year is the leading cause of payroll errors."}
        </p>
        <p>
          {isFr
            ? "Pour la conformité ARC : les remises de retenues à la source dépendent de votre seuil de remettant et de la fréquence. Vérifiez les dates limites avec votre logiciel de paie ou votre comptable—cet outil aide à planifier mais ne remplace pas un avis fiscal."
            : "For CRA compliance: source-deduction remittance dates depend on your remitter threshold and pay frequency. Confirm exact deadlines with your payroll software or accountant—this tool helps you plan but is not tax advice."}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Questions fréquentes" : "Frequently asked questions"}</h2>
        {faq.map((entry) => (
          <article key={entry.question} className="faqEntry">
            <h3>{entry.question}</h3>
            <p>{entry.answer}</p>
          </article>
        ))}
      </section>

      <section className="panel quickLinks">
        <h2>{isFr ? "Outils liés" : "Related tools"}</h2>
        <div className="linkGrid">
          <Link href={`/${locale}/business-days-calculator`} prefetch={false}>
            {isFr ? "Jours ouvrables" : "Business days"}
          </Link>
          <Link href={`/${locale}/date-to-week`} prefetch={false}>
            {isFr ? "Date ↔ semaine" : "Date ↔ week"}
          </Link>
          <Link href={`/${locale}/long-weekends/${startYear}`} prefetch={false}>
            {isFr ? `Longs week-ends ${startYear}` : `${startYear} long weekends`}
          </Link>
          <Link href={`/${locale}/calendar/${startYear}`} prefetch={false}>
            {isFr ? `Calendrier ${startYear}` : `${startYear} calendar`}
          </Link>
        </div>
      </section>
    </main>
  );
}
