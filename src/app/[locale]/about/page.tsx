import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { buildBreadcrumbJsonLd } from "@/lib/seo-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isFr = locale === "fr";
  const title = isFr ? "À propos et méthodologie — WhatWeek.ca" : "About & methodology — WhatWeek.ca";
  const description = isFr
    ? "Sources de données, systèmes de semaines ISO et Canada, fuseaux horaires et limites de WhatWeek.ca."
    : "Data sources, ISO vs Canada week systems, time zones, and limitations for WhatWeek.ca.";
  const canonical = `https://whatweek.ca/${locale}/about`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    keywords: isFr
      ? ["à propos de whatweek", "calendrier semaine canada", "numérotation des semaines", "norme iso 8601", "outil calendrier"]
      : ["about whatweek", "canada week calendar", "week numbering", "iso 8601 standard", "calendar tool"],
    alternates: {
      canonical,
      languages: {
        "en-CA": "https://whatweek.ca/en/about",
        "fr-CA": "https://whatweek.ca/fr/about",
        "x-default": "https://whatweek.ca/en/about",
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
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

export default async function AboutPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const dictionary = getDictionary(locale);
  const dateModified = new Date().toISOString().slice(0, 10);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: locale === "fr" ? "À propos" : "About", path: "/about" },
  ]);

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `https://whatweek.ca/${locale}/about#webpage`,
    url: `https://whatweek.ca/${locale}/about`,
    name: locale === "fr" ? "À propos — WhatWeek.ca" : "About — WhatWeek.ca",
    dateModified,
    inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
    isPartOf: { "@id": "https://whatweek.ca/#website" },
  };

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbJsonLd, webPageJsonLd],
  };

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graphJsonLd) }} />
      <SiteHeader locale={locale} />
      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`}>{locale === "fr" ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{dictionary.aboutNav}</span>
        </nav>
        <h1>{locale === "fr" ? "À propos de WhatWeek.ca" : "About WhatWeek.ca"}</h1>
        <p className="subtle" style={{ maxWidth: "720px", margin: "0.75rem auto 0", lineHeight: 1.65 }}>
          {locale === "fr"
            ? "WhatWeek.ca est un calendrier bilingue axé sur le Canada : numéros de semaine (ISO 8601 ou semaine dimanche–samedi), jours fériés et repères de longs week-ends par province. Les guides détaillés sont publiés séparément sur le blog."
            : "WhatWeek.ca is a bilingual, Canada-focused week calendar: ISO 8601 or Sunday–Saturday week numbers, public holidays, and long-weekend context by province. Deeper guides live on our blog."}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Sources et exactitude" : "Data sources & accuracy"}</h2>
        <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.6 }}>
          <li>
            {locale === "fr" ? "Jours fériés : " : "Public holidays: "}
            <a href="https://date.nager.at/swagger/index.html" rel="nofollow noreferrer" target="_blank">
              Nager.Date API
            </a>
            {locale === "fr"
              ? " (Canada), mise en cache côté serveur avec revalidation d’environ 24 h."
              : " (Canada), cached on the server with roughly 24-hour revalidation."}
          </li>
          <li>
            {locale === "fr" ? "Semaines ISO : " : "ISO weeks: "}
            <a href="https://www.iso.org/iso-8601-date-and-time-format.html" rel="nofollow noreferrer" target="_blank">
              ISO 8601
            </a>
            {locale === "fr" ? " (lundi–dimanche)." : " (Monday–Sunday)."}
          </li>
          <li>
            {locale === "fr"
              ? "Les numéros de semaine « Canada » suivent une semaine dimanche–samedi ; ils peuvent différer de l’ISO pour les mêmes dates civiles."
              : "“Canada” week numbers use a Sunday–Saturday week; they can differ from ISO for the same calendar dates."}
          </li>
        </ul>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Définitions rapides (citables)" : "Quick definitions (citable)"}</h2>
        <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.65 }}>
          <li>
            {locale === "fr"
              ? "Semaine ISO 8601 : semaine du lundi au dimanche, utilisée dans des contextes internationaux."
              : "ISO 8601 week: a Monday–Sunday week used in international contexts."}
          </li>
          <li>
            {locale === "fr"
              ? "Semaine « Canada » : semaine du dimanche au samedi, courante dans plusieurs contextes locaux."
              : "“Canada” week: a Sunday–Saturday week commonly used in local contexts."}
          </li>
          <li>
            {locale === "fr"
              ? "Un même jour civil peut avoir un numéro différent selon le système choisi (ISO vs Canada)."
              : "The same calendar date can map to different week numbers depending on the selected system (ISO vs Canada)."}
          </li>
          <li>
            {locale === "fr"
              ? "Le numéro « actuel » dépend du fuseau horaire et est recalculé avec l’heure canadienne pertinente."
              : "The “current” week depends on time zone and is recalculated using relevant Canadian time-zone context."}
          </li>
        </ul>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Faits clés" : "Key facts"}</h2>
        <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.65 }}>
          <li>
            {locale === "fr"
              ? "Les jours fériés affichés proviennent de Nager.Date (Canada) et sont revalidés environ toutes les 24 h."
              : "Displayed public holidays are sourced from Nager.Date (Canada) and revalidated roughly every 24 hours."}
          </li>
          <li>
            {locale === "fr"
              ? "Les longs week-ends sont calculés à partir des fériés et des jours adjacents."
              : "Long weekends are computed from statutory holidays and adjacent days."}
          </li>
          <li>
            {locale === "fr"
              ? "Les pages de semaine et de calendrier sont les meilleures URL à citer pour une valeur précise."
              : "Week and calendar route pages are the best URLs to cite for a specific numeric value."}
          </li>
        </ul>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Fuseaux et « aujourd’hui »" : "Time zones & “today”"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          {locale === "fr"
            ? "La date « aujourd’hui » et les bornes de semaine tiennent compte des fuseaux utilisés dans l’outil (Canada). Vérifiez toujours les règles internes de votre employeur ou logiciel de paie pour les coupures exactes."
            : "“Today” and week boundaries use the time zones wired into the tool (Canada). Always confirm your employer or payroll software cutoffs for authoritative deadlines."}
        </p>
      </section>

      <section className="panel contentSection" aria-labelledby="maintainer-heading">
        <h2 id="maintainer-heading">{locale === "fr" ? "Qui entretient cette référence" : "Who maintains this reference"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          {locale === "fr"
            ? "WhatWeek.ca est rédigé comme référence pratique bilingue sur les numéros de semaine au Canada, l’ISO 8601 vs la semaine dimanche–samedi, et le contexte des jours fériés. Les chiffres affichés sur le calendrier suivent le système de semaine et les règles de fuseau que vous y choisissez."
            : "WhatWeek.ca is edited as a practical, bilingual reference for Canadian week numbers, ISO 8601 vs Sunday–Saturday counting, and holiday context. Figures on the calendar follow the week system and time-zone rules you choose there."}
        </p>
        <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.65 }}>
          {locale === "fr" ? (
            <>
              <li>
                Les définitions suivent l’ISO 8601 (lundi–dimanche) et la semaine « Canada » (dimanche–samedi) ; vous pouvez
                changer de système sans changer de province.
              </li>
              <li>
                Les jours fériés proviennent de l’API Nager.Date (Canada) et sont revalidés côté serveur environ toutes les
                24 h.
              </li>
              <li>
                Ce n’est pas un avis de paie ou juridique—confirmez toujours les coupures avec votre employeur, syndicat ou
                conseiller.
              </li>
            </>
          ) : (
            <>
              <li>
                Definitions align with ISO 8601 (Monday–Sunday) and the common Canada-style week (Sunday–Saturday); you can
                switch systems without changing provinces.
              </li>
              <li>
                Public holiday dates come from the Nager.Date API (Canada) and are revalidated on the server about every 24
                hours.
              </li>
              <li>
                This is not payroll or legal advice—always confirm cutoffs with your employer, union, or counsel.
              </li>
            </>
          )}
        </ul>
        <p style={{ lineHeight: 1.65, marginTop: "0.75rem" }}>
          {locale === "fr"
            ? "WhatWeek.ca est aussi maintenu comme outil de référence pratique sur les semaines et le calendrier canadien. Les données brutes sont sourcées publiquement, puis normalisées pour les vues semaine/calendrier et la localisation bilingue."
            : "WhatWeek.ca is also maintained as a practical reference for Canadian week and calendar lookup. Raw data is publicly sourced, then normalized for week/calendar views and bilingual localization."}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Limites" : "Limitations"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          {locale === "fr"
            ? "Les jours fériés et les longs week-ends sont indicatifs et peuvent varier selon la convention d’entreprise ou les accords collectifs. Ce site ne fournit pas de conseils juridiques ou de paie."
            : "Holidays and long weekends are indicative and can vary by workplace policy or collective agreements. This site is not legal or payroll advice."}
        </p>
      </section>

      <p className="subtle" style={{ textAlign: "center" }}>
        <Link href={`/${locale}/privacy`}>{dictionary.linkPrivacy}</Link>
        {" · "}
        <Link href={`/${locale}`}>{locale === "fr" ? "Retour au calendrier" : "Back to calendar"}</Link>
      </p>
    </main>
  );
}
