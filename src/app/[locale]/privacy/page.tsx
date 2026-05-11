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
  const title = isFr ? "Politique de confidentialité — WhatWeek.ca" : "Privacy policy — WhatWeek.ca";
  const description = isFr
    ? "Comment WhatWeek.ca traite les données, les cookies et les outils d’analyse facultatifs."
    : "How WhatWeek.ca handles data, cookies, and optional analytics tools.";
  const canonical = `https://whatweek.ca/${locale}/privacy`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-CA": "https://whatweek.ca/en/privacy",
        "fr-CA": "https://whatweek.ca/fr/privacy",
        "x-default": "https://whatweek.ca/en/privacy",
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

export default async function PrivacyPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const dictionary = getDictionary(locale);
  const dateModified = new Date().toISOString().slice(0, 10);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: dictionary.linkPrivacy, path: "/privacy" },
  ]);

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `https://whatweek.ca/${locale}/privacy#webpage`,
    url: `https://whatweek.ca/${locale}/privacy`,
    name: dictionary.linkPrivacy,
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
          <span>{dictionary.linkPrivacy}</span>
        </nav>
        <h1>{dictionary.linkPrivacy}</h1>
        <p className="subtle" style={{ maxWidth: "720px", margin: "0.75rem auto 0", lineHeight: 1.65 }}>
          {locale === "fr" ? (
            <>
              <strong>Dernière mise à jour : {dateModified}.</strong> Informations générales sur les outils utilisés sur ce
              site. Pour des questions précises, contactez votre conseiller juridique.
            </>
          ) : (
            <>
              <strong>Last updated: {dateModified}.</strong> General information about tools used on this site. For specific
              questions, consult a qualified legal advisor.
            </>
          )}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Hébergement et journaux" : "Hosting & logs"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          {locale === "fr"
            ? "Le site est hébergé sur Vercel. Les fournisseurs d’hébergement peuvent traiter des données techniques (adresse IP, user-agent, horodatage) conformément à leurs politiques."
            : "The site is hosted on Vercel. Hosting providers may process technical data (IP address, user agent, timestamps) under their own policies."}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Analyses facultatives" : "Optional analytics"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          {locale === "fr"
            ? "Si vous acceptez la bannière cookies/scripts, nous pouvons charger Google Analytics et Ahrefs Web Analytics pour mesurer le trafic agrégé. Si vous refusez, ces scripts ne sont pas chargés sur votre appareil."
            : "If you accept the cookie/script banner, we may load Google Analytics and Ahrefs Web Analytics for aggregate traffic measurement. If you decline, those scripts are not loaded on your device."}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Vos choix" : "Your choices"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          {locale === "fr"
            ? "Vous pouvez effacer le stockage local du site (clé ww_analytics_consent) dans les paramètres du navigateur pour revoir la bannière, ou refuser l’analyse lors de la prochaine visite."
            : "You can clear site local storage (key ww_analytics_consent) in your browser settings to see the banner again, or decline analytics on your next visit."}
        </p>
      </section>

      <p className="subtle" style={{ textAlign: "center" }}>
        <Link href={`/${locale}/about`}>{dictionary.linkAbout}</Link>
        {" · "}
        <Link href={`/${locale}`}>{locale === "fr" ? "Retour au calendrier" : "Back to calendar"}</Link>
      </p>
    </main>
  );
}
