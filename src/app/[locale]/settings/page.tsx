import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { WeekSettingsForm } from "@/components/WeekSettingsForm";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildLocaleAlternates } from "@/lib/seo-metadata";

type FirstDay = "monday" | "sunday" | "saturday";
type WeekRule = "iso" | "first-day" | "first-four-day";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ firstDay?: string; rule?: string; preset?: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isFr = locale === "fr";
  const title = isFr ? "Paramètres de semaine — WhatWeek.ca" : "Week settings — WhatWeek.ca";
  const description = isFr
    ? "Personnalisez le premier jour de la semaine (lundi, dimanche ou samedi) et la règle de la semaine 1 (ISO 8601 ou autre). Préférences sauvegardées sur votre appareil."
    : "Customise the first day of the week (Monday, Sunday, Saturday) and the week-1 rule (ISO 8601 or other). Preferences saved on your device.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    alternates: buildLocaleAlternates("/settings"),
    robots: { index: false, follow: true },
    openGraph: { title, description, type: "website", url: `https://whatweek.ca/${locale}/settings`, locale: isFr ? "fr_CA" : "en_CA", images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

function parseFirstDay(input: string | undefined | null): FirstDay {
  if (input === "sunday" || input === "saturday") return input;
  return "monday";
}

function parseRule(input: string | undefined | null): WeekRule {
  if (input === "first-day" || input === "first-four-day") return input;
  return "iso";
}

export default async function SettingsPage({ params, searchParams }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";

  const query = await searchParams;
  const cookieStore = await cookies();
  const firstDay = parseFirstDay(query.firstDay ?? cookieStore.get("ww_first_day")?.value);
  const rule = parseRule(query.rule ?? cookieStore.get("ww_week_rule")?.value);

  const faq = [
    {
      question: isFr ? "Mes préférences sont-elles synchronisées entre appareils ?" : "Are my preferences synced across devices?",
      answer: isFr
        ? "Non — elles sont sauvegardées dans un cookie sur cet appareil. Pour synchroniser, copiez le lien partageable et ouvrez-le sur l'autre appareil."
        : "No — they are saved in a cookie on this device. To sync, copy the shareable link and open it on the other device.",
    },
    {
      question: isFr ? "ISO 8601 est-il toujours le meilleur choix ?" : "Is ISO 8601 always the best choice?",
      answer: isFr
        ? "ISO 8601 est la norme internationale. Pour la paie au Canada ou le calendrier scolaire américain, beaucoup utilisent dimanche–samedi à la place."
        : "ISO 8601 is the international standard. For Canadian payroll or US school calendars, many people prefer Sunday–Saturday instead.",
    },
    {
      question: isFr ? "Comment réinitialiser ?" : "How do I reset?",
      answer: isFr
        ? "Cliquez sur « Réinitialiser » pour effacer le cookie et revenir aux paramètres par défaut (lundi + ISO 8601)."
        : "Click 'Reset' to clear the cookie and revert to the defaults (Monday + ISO 8601).",
    },
    {
      question: isFr ? "Comment fonctionnent les préréglages partageables ?" : "How do shareable presets work?",
      answer: isFr
        ? "Donnez un nom à votre configuration et le préréglage est stocké localement (localStorage). Le lien ?preset=<id> applique ce préréglage si l'autre appareil le possède aussi."
        : "Name your configuration and the preset is saved locally (localStorage). The ?preset=<id> link applies it on any device that already has the same preset stored.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: isFr ? "Paramètres" : "Settings", path: "/settings" },
  ]);
  const graphJsonLd = { "@context": "https://schema.org", "@graph": [breadcrumbJsonLd, faqJsonLd] };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main id="main-content" className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{isFr ? "Paramètres" : "Settings"}</span>
        </nav>
        <h1>{isFr ? "Paramètres de semaine" : "Week settings"}</h1>
        <p className="subtle heroLead">
          {isFr
            ? "Personnalisez le premier jour de la semaine et la règle de la semaine 1. Vos choix sont enregistrés sur cet appareil et peuvent être partagés via un lien."
            : "Customise the first day of the week and the week-1 rule. Your choices are saved on this device and can be shared via a link."}
        </p>
      </section>

      <section className="panel">
        <WeekSettingsForm
          locale={locale}
          initialFirstDay={firstDay}
          initialRule={rule}
          initialPresetId={query.preset}
        />
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Aide" : "Help"}</h2>
        <p>
          {isFr
            ? "ISO 8601 (par défaut) commence chaque semaine un lundi, et la semaine 1 contient le premier jeudi de l'année. C'est la norme internationale."
            : "ISO 8601 (default) starts each week on Monday, and week 1 contains the first Thursday of the year. This is the international standard."}
        </p>
        <p>
          {isFr
            ? "Le système Canada / américain commence un dimanche et la semaine 1 contient le 1ᵉʳ janvier — pratique pour la paie nord-américaine et les calendriers scolaires."
            : "The Canada / US system starts on Sunday and week 1 contains January 1 — handy for North-American payroll and school calendars."}
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
          <Link href={`/${locale}/iso-week-number-canada`} prefetch={false}>{isFr ? "Semaine ISO Canada" : "ISO week Canada"}</Link>
          <Link href={`/${locale}/date-to-week`} prefetch={false}>{isFr ? "Date ↔ semaine" : "Date ↔ week"}</Link>
          <Link href={`/${locale}/about`} prefetch={false}>{isFr ? "À propos" : "About"}</Link>
          <Link href={`/${locale}/api-docs`} prefetch={false}>{isFr ? "API" : "API"}</Link>
        </div>
      </section>
    </main>
  );
}
