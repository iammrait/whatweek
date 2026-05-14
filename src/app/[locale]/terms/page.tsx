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
  const title = isFr ? "Conditions d’utilisation — WhatWeek.ca" : "Terms of service — WhatWeek.ca";
  const description = isFr
    ? "Conditions générales d’utilisation de WhatWeek.ca (outil de calendrier et de semaines)."
    : "Terms of service for WhatWeek.ca (week and calendar tools).";
  const canonical = `https://whatweek.ca/${locale}/terms`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-CA": "https://whatweek.ca/en/terms",
        "fr-CA": "https://whatweek.ca/fr/terms",
        "x-default": "https://whatweek.ca/en/terms",
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

export default async function TermsPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const dictionary = getDictionary(locale);
  const dateModified = new Date().toISOString().slice(0, 10);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: dictionary.linkTerms, path: "/terms" },
  ]);

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `https://whatweek.ca/${locale}/terms#webpage`,
    url: `https://whatweek.ca/${locale}/terms`,
    name: dictionary.linkTerms,
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
          <span>{dictionary.linkTerms}</span>
        </nav>
        <h1>{dictionary.linkTerms}</h1>
        <p className="subtle" style={{ maxWidth: "720px", margin: "0.75rem auto 0", lineHeight: 1.65 }}>
          <time dateTime={dateModified}>
            {locale === "fr" ? "Dernière mise à jour : " : "Last updated: "}
            {dateModified}
          </time>
          {". "}
          {locale === "fr"
            ? "Texte d’information générale. Pour des questions juridiques précises, consultez un professionnel."
            : "General information only. For specific legal questions, consult a qualified professional."}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Acceptation" : "Acceptance"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          {locale === "fr"
            ? "En utilisant WhatWeek.ca, vous acceptez ces conditions. Si vous n’acceptez pas ces conditions, veuillez ne pas utiliser le site."
            : "By using WhatWeek.ca, you agree to these terms. If you do not agree, please do not use the site."}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Nature du service" : "Nature of the service"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          {locale === "fr"
            ? "WhatWeek.ca fournit des outils de calendrier et de numérotation des semaines à titre informatif. Les résultats peuvent différer selon le fuseau horaire, la province ou les conventions locales. Rien sur ce site ne constitue des conseils juridiques, de paie ou comptables."
            : "WhatWeek.ca provides calendar and week-number tools for informational purposes. Results can differ by time zone, province, or local conventions. Nothing on this site is legal, payroll, or accounting advice."}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Exactitude et disponibilité" : "Accuracy & availability"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          {locale === "fr"
            ? "Nous visons l’exactitude, mais les données (y compris les jours fériés) peuvent changer ou contenir des erreurs. Le service est fourni « tel quel », sans garantie expresse ou implicite."
            : "We aim for accuracy, but data (including holidays) can change or contain errors. The service is provided “as is,” without express or implied warranties."}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Liens externes" : "External links"}</h2>
        <p style={{ lineHeight: 1.65 }}>
          {locale === "fr"
            ? "Le site peut renvoyer vers des services tiers (par ex. blog, API documentées). Nous ne contrôlons pas ces sites et ne sommes pas responsables de leur contenu."
            : "The site may link to third-party services (for example, our blog or documented APIs). We do not control those sites and are not responsible for their content."}
        </p>
      </section>

      <p className="subtle" style={{ textAlign: "center" }}>
        <Link href={`/${locale}/privacy`}>{dictionary.linkPrivacy}</Link>
        {" · "}
        <Link href={`/${locale}/contact`}>{dictionary.linkContact}</Link>
        {" · "}
        <Link href={`/${locale}`}>{locale === "fr" ? "Retour au calendrier" : "Back to calendar"}</Link>
      </p>
    </main>
  );
}
