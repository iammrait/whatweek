import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { buildLocaleAlternates } from "@/lib/seo-metadata";

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
    ? "Widget intégrable & API JSON"
    : "Embeddable widget & JSON API";
  const description = isFr
    ? "Affichez la semaine actuelle au Canada sur votre site avec un widget iframe ou consommez l’API publique JSON."
    : "Show the current Canadian week on your site with an iframe widget or consume the public JSON API.";
  return {
    title,
    description,
    alternates: buildLocaleAlternates("/embed"),
  };
}

export default async function EmbedDocsPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";

  const iframeSnippet = `<iframe
  src="https://whatweek.ca/${locale}/embed/week"
  title="WhatWeek.ca current Canadian week"
  width="280"
  height="160"
  loading="lazy"
  style="border:0;border-radius:12px;background:transparent">
</iframe>`;

  const monthSnippet = `<iframe
  src="https://whatweek.ca/${locale}/embed/month"
  title="WhatWeek.ca current month with week numbers"
  width="360"
  height="320"
  loading="lazy"
  style="border:0;border-radius:12px;background:transparent">
</iframe>`;

  const yearSnippet = `<iframe
  src="https://whatweek.ca/${locale}/embed/year"
  title="WhatWeek.ca year week numbers"
  width="480"
  height="360"
  loading="lazy"
  style="border:0;border-radius:12px;background:transparent">
</iframe>`;

  const apiSnippet = `curl "https://whatweek.ca/api/week.json?province=on&locale=${locale}"`;

  return (
    <main className="container">
      <SiteHeader locale={locale} />
      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>
            {isFr ? "Accueil" : "Home"}
          </Link>
          <span> / </span>
          <span>{isFr ? "Widget & API" : "Widget & API"}</span>
        </nav>
        <h1>{isFr ? "Widget intégrable et API JSON" : "Embeddable widget & JSON API"}</h1>
        <p className="subtle heroLead">
          {isFr
            ? "Ajoutez la semaine actuelle au Canada à votre site, votre intranet ou votre CRM en moins d’une minute."
            : "Drop the current Canadian week onto your site, intranet, or CRM in under a minute."}
        </p>
      </section>

      <section className="panel">
        <h2>{isFr ? "Aperçu" : "Live preview"}</h2>
        <iframe
          src={`/${locale}/embed/week`}
          title={isFr ? "Aperçu du widget" : "Widget preview"}
          width={280}
          height={160}
          loading="lazy"
          style={{ border: 0, borderRadius: 12, background: "transparent" }}
        />
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Code à coller — semaine" : "Copy-paste snippet — week"}</h2>
        <pre className="codeBlock">
          <code>{iframeSnippet}</code>
        </pre>
        <h3>{isFr ? "Paramètres pris en charge" : "Supported query parameters"}</h3>
        <ul>
          <li>
            <code>locale</code> — <code>en</code> {isFr ? "ou" : "or"} <code>fr</code>
          </li>
          <li>
            <code>province</code> — {isFr ? "code à 2 lettres" : "two-letter code"} (
            <code>on</code>, <code>qc</code>, <code>bc</code>, …)
          </li>
        </ul>
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Widget mois" : "Month widget"}</h2>
        <p className="subtle">
          {isFr
            ? "Calendrier du mois en cours avec les numéros de semaine en colonne."
            : "Current month grid with week numbers in the leading column."}
        </p>
        <iframe
          src={`/${locale}/embed/month`}
          title={isFr ? "Aperçu du widget mois" : "Month widget preview"}
          width={360}
          height={320}
          loading="lazy"
          style={{ border: 0, borderRadius: 12, background: "transparent" }}
        />
        <pre className="codeBlock">
          <code>{monthSnippet}</code>
        </pre>
        <p className="subtle">
          <code>?system=iso</code> {isFr ? "pour ISO 8601" : "for ISO 8601"} ·{" "}
          <code>?system=canada</code> {isFr ? "pour dim–sam" : "for Sun–Sat"}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Widget année" : "Year widget"}</h2>
        <p className="subtle">
          {isFr
            ? "Mini-grille des 12 mois avec la semaine en cours surlignée."
            : "Mini-grid of all 12 months with the current week highlighted."}
        </p>
        <iframe
          src={`/${locale}/embed/year`}
          title={isFr ? "Aperçu du widget année" : "Year widget preview"}
          width={480}
          height={360}
          loading="lazy"
          style={{ border: 0, borderRadius: 12, background: "transparent" }}
        />
        <pre className="codeBlock">
          <code>{yearSnippet}</code>
        </pre>
        <p className="subtle">
          <code>?year=2026</code> {isFr ? "pour une année spécifique" : "for a specific year"}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "API JSON" : "JSON API"}</h2>
        <p>
          {isFr
            ? "Endpoint public, sans clé d’API, mis en cache à la périphérie. Idéal pour bots Slack, dashboards et automatisations."
            : "Public, no-API-key, edge-cached endpoint. Ideal for Slack bots, dashboards, and automations."}
        </p>
        <pre className="codeBlock">
          <code>{apiSnippet}</code>
        </pre>
        <p>
          <Link href={`/api/week.json?locale=${locale}`} prefetch={false}>
            {isFr ? "Voir un exemple de réponse →" : "See an example response →"}
          </Link>
        </p>
      </section>
    </main>
  );
}
