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
  const title = isFr ? "Politique éditoriale — WhatWeek.ca" : "Editorial policy — WhatWeek.ca";
  const description = isFr
    ? "Comment nous publions et révisons les guides sur le blog whatweek.ca et comment signaler une erreur."
    : "How we publish and revise guides on blog.whatweek.ca and how to report an error.";
  const canonical = `https://whatweek.ca/${locale}/editorial`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-CA": "https://whatweek.ca/en/editorial",
        "fr-CA": "https://whatweek.ca/fr/editorial",
        "x-default": "https://whatweek.ca/en/editorial",
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

export default async function EditorialPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const dictionary = getDictionary(locale);
  const dateModified = new Date().toISOString().slice(0, 10);
  const mailHref = `mailto:hello@whatweek.ca?subject=${encodeURIComponent(
    locale === "fr" ? "Correction éditoriale WhatWeek" : "WhatWeek editorial correction",
  )}`;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: dictionary.linkEditorial, path: "/editorial" },
  ]);

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `https://whatweek.ca/${locale}/editorial#webpage`,
    url: `https://whatweek.ca/${locale}/editorial`,
    name: dictionary.linkEditorial,
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
          <span>{dictionary.linkEditorial}</span>
        </nav>
        <h1>{dictionary.linkEditorial}</h1>
        <p className="subtle" style={{ maxWidth: "720px", margin: "0.75rem auto 0", lineHeight: 1.65 }}>
          <time dateTime={dateModified}>
            {locale === "fr" ? "Dernière mise à jour : " : "Last updated: "}
            {dateModified}
          </time>
          {". "}
          {locale === "fr"
            ? "Cette page décrit les principes du blog whatweek.ca. Les outils interactifs sur ce site suivent la méthodologie décrite dans À propos."
            : "This page describes principles for blog.whatweek.ca. Interactive tools on this site follow the methodology described in About."}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Objectif éditorial" : "Editorial purpose"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          {locale === "fr"
            ? "Les articles visent à expliquer clairement les semaines ISO, la paie, les congés et le calendrier canadien, avec des sources vérifiables lorsque c’est possible."
            : "Articles aim to clearly explain ISO weeks, payroll, holidays, and the Canadian calendar, with verifiable sources where possible."}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Corrections" : "Corrections"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          {locale === "fr" ? (
            <>
              Si vous repérez une erreur factuelle, écrivez à <a href={mailHref}>hello@whatweek.ca</a> avec le titre de
              l’article et un lien. Nous examinons les signalements et mettons à jour les pages lorsque c’est justifié.
            </>
          ) : (
            <>
              If you spot a factual error, email <a href={mailHref}>hello@whatweek.ca</a> with the article title and URL.
              We review reports and update pages when appropriate.
            </>
          )}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Blog" : "Blog"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          <a href="https://blog.whatweek.ca/" target="_blank" rel="noopener noreferrer">
            blog.whatweek.ca
          </a>
          {" — "}
          {locale === "fr"
            ? "guides plus longs et articles, principalement en anglais."
            : "longer guides and articles, primarily in English."}
        </p>
      </section>

      <p className="subtle" style={{ textAlign: "center" }}>
        <Link href={`/${locale}/about`}>{dictionary.linkAbout}</Link>
        {" · "}
        <Link href={`/${locale}/terms`}>{dictionary.linkTerms}</Link>
        {" · "}
        <Link href={`/${locale}`}>{locale === "fr" ? "Retour au calendrier" : "Back to calendar"}</Link>
      </p>
    </main>
  );
}
