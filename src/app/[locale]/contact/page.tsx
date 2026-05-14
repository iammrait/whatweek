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
  const title = isFr ? "Contact — WhatWeek.ca" : "Contact — WhatWeek.ca";
  const description = isFr
    ? "Comment joindre l’équipe whatweek.ca pour des questions sur le site, la confidentialité ou les partenariats."
    : "How to reach the whatweek.ca team for site questions, privacy, or partnerships.";
  const canonical = `https://whatweek.ca/${locale}/contact`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-CA": "https://whatweek.ca/en/contact",
        "fr-CA": "https://whatweek.ca/fr/contact",
        "x-default": "https://whatweek.ca/en/contact",
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

export default async function ContactPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const dictionary = getDictionary(locale);
  const dateModified = new Date().toISOString().slice(0, 10);
  const mailHref = `mailto:hello@whatweek.ca?subject=${encodeURIComponent(
    locale === "fr" ? "Question WhatWeek.ca" : "WhatWeek.ca inquiry",
  )}`;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: dictionary.linkContact, path: "/contact" },
  ]);

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `https://whatweek.ca/${locale}/contact#webpage`,
    url: `https://whatweek.ca/${locale}/contact`,
    name: dictionary.linkContact,
    dateModified,
    inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
    isPartOf: { "@id": "https://whatweek.ca/#website" },
  };

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbJsonLd, webPageJsonLd],
  };

  return (
    <main id="main-content" className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graphJsonLd) }} />
      <SiteHeader locale={locale} />
      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`}>{locale === "fr" ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{dictionary.linkContact}</span>
        </nav>
        <h1>{dictionary.linkContact}</h1>
        <p className="subtle" style={{ maxWidth: "720px", margin: "0.75rem auto 0", lineHeight: 1.65 }}>
          <time dateTime={dateModified}>
            {locale === "fr" ? "Dernière mise à jour : " : "Last updated: "}
            {dateModified}
          </time>
          {". "}
          {dictionary.trustByline}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Courriel" : "Email"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          {locale === "fr" ? (
            <>
              Pour les questions générales, les partenariats ou les signalements liés au site, écrivez à{" "}
              <a href={mailHref}>hello@whatweek.ca</a>.
            </>
          ) : (
            <>
              For general questions, partnerships, or site-related reports, email{" "}
              <a href={mailHref}>hello@whatweek.ca</a>.
            </>
          )}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Adresse d’exploitation" : "Operating location"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          {locale === "fr"
            ? "WhatWeek.ca est exploité depuis le Canada. Il n’y a pas de guichet physique public pour ce service en ligne."
            : "WhatWeek.ca is operated from Canada. There is no public walk-in location for this online service."}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Confidentialité et conditions" : "Privacy & terms"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          <Link href={`/${locale}/privacy`}>{dictionary.linkPrivacy}</Link>
          {" · "}
          <Link href={`/${locale}/terms`}>{dictionary.linkTerms}</Link>
          {" · "}
          <Link href={`/${locale}/editorial`}>{dictionary.linkEditorial}</Link>
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
