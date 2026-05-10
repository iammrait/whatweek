import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { buildFaqJsonLd, buildLocaleAlternates } from "@/lib/seo-metadata";
import { provinceCodes, provinceNames } from "@/lib/provinces";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isFr = locale === "fr";
  const title = isFr ? "Documentation API — jours fériés Canada (JSON)" : "API Documentation — Canadian Holidays (JSON)";
  const description = isFr
    ? "API JSON publique et gratuite pour les jours fériés statutaires canadiens, par province et par année. Documentation, exemples cURL et politique de mise en cache."
    : "Free public JSON API for Canadian statutory holidays by province and year. Endpoints, cURL examples, and caching guidance.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    alternates: buildLocaleAlternates("/api-docs"),
    openGraph: { title, description, type: "website", url: `https://whatweek.ca/${locale}/api-docs`, locale: isFr ? "fr_CA" : "en_CA", images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function ApiDocsPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";

  const faq = [
    {
      question: isFr ? "L'API est-elle gratuite ?" : "Is the API free?",
      answer: isFr
        ? "Oui — l'API est ouverte, sans clé pour un usage léger (60 req/min/IP), et CORS-permissive. Les partenaires à fort volume peuvent demander une clé gratuite."
        : "Yes — the API is open and key-less for light use (60 req/min/IP), and CORS-friendly. High-volume partners can request a free key.",
    },
    {
      question: isFr ? "Quelle est la limite de débit ?" : "Is there a rate limit?",
      answer: isFr
        ? "60 requêtes par minute par IP en mode anonyme; 600+/min avec une clé partenaire. Les en-têtes X-RateLimit-* indiquent l'utilisation. Voir /api-keys pour demander une clé."
        : "60 requests per minute per IP in anonymous mode; 600+/min with a partner key. X-RateLimit-* headers expose usage. See /api-keys to request a key.",
    },
    {
      question: isFr ? "D'où viennent les données ?" : "Where does the data come from?",
      answer: isFr
        ? "L'API publique Nager.Date est la source primaire. Une retombée fédérale est utilisée si Nager.Date n'est pas disponible."
        : "The Nager.Date public API is the primary source. A federal fallback is used if Nager.Date is unavailable.",
    },
    {
      question: isFr ? "Puis-je mettre les données en cache ?" : "Can I cache the data?",
      answer: isFr
        ? "Oui, recommandé. La payload est immuable une fois l'année en cours commencée. Cache-Control conseille 1h navigateur, 24h CDN."
        : "Yes, recommended. The payload is essentially immutable once the year has begun. Cache-Control suggests 1h browser, 24h CDN.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);

  const apiJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebAPI",
    name: isFr ? "API jours fériés WhatWeek.ca" : "WhatWeek.ca Canadian holidays API",
    description: isFr ? "API JSON publique pour les jours fériés canadiens." : "Public JSON API for Canadian statutory holidays.",
    documentation: `https://whatweek.ca/${locale}/api-docs`,
    inLanguage: isFr ? "fr-CA" : "en-CA",
  };

  const graphJsonLd = { "@context": "https://schema.org", "@graph": [faqJsonLd, apiJsonLd] };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  const exampleHolidays = `curl https://whatweek.ca/api/holidays.json?year=2026&province=on`;
  const exampleHolidaysWithLw = `curl "https://whatweek.ca/api/holidays.json?year=2026&province=qc&longWeekends=1"`;
  const exampleWeekJson = `curl "https://whatweek.ca/api/week.json?province=bc&locale=en"`;
  const exampleIcs = `curl "https://whatweek.ca/api/holidays.ics?year=2026&province=ab" -o holidays-2026-AB.ics`;

  const sampleResponse = `{
  "year": 2026,
  "province": { "code": "CA-ON", "nameEn": "Ontario", "nameFr": "Ontario" },
  "count": 13,
  "holidays": [
    {
      "date": "2026-01-01",
      "nameEn": "New Year's Day",
      "nameFr": "Jour de l'An",
      "global": true,
      "counties": null,
      "isoWeek": 1
    }
  ],
  "source": {
    "site": "https://whatweek.ca",
    "data": "https://date.nager.at",
    "docs": "https://whatweek.ca/en/api-docs"
  }
}`;

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{isFr ? "Documentation API" : "API documentation"}</span>
        </nav>
        <h1>{isFr ? "API jours fériés Canada — JSON" : "Canadian Holidays API — JSON"}</h1>
        <p className="subtle heroLead">
          {isFr
            ? "API publique, gratuite et sans clé : jours fériés fédéraux et provinciaux, longs week-ends, et numéro de semaine ISO. Compatible CORS, données mises en cache."
            : "Public, free, key-less API: federal and provincial statutory holidays, long weekends, and ISO week numbers. CORS-friendly, edge-cached."}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>GET <code>/api/holidays.json</code></h2>
        <p>{isFr ? "Retourne les jours fériés pour une année et une province." : "Returns statutory holidays for a year and (optional) province."}</p>
        <h3>{isFr ? "Paramètres de requête" : "Query parameters"}</h3>
        <table className="holidayTable">
          <thead>
            <tr>
              <th>{isFr ? "Nom" : "Name"}</th>
              <th>{isFr ? "Type" : "Type"}</th>
              <th>{isFr ? "Description" : "Description"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>year</code></td>
              <td>integer</td>
              <td>{isFr ? "Année (1900–2100). Par défaut : année courante." : "Year (1900–2100). Defaults to the current year."}</td>
            </tr>
            <tr>
              <td><code>province</code></td>
              <td>string</td>
              <td>{isFr ? "Code province (ON, QC, BC, AB, ...). Si omis, jours fériés fédéraux." : "Province code (ON, QC, BC, AB, ...). If omitted, returns federal holidays."}</td>
            </tr>
            <tr>
              <td><code>longWeekends</code></td>
              <td>0 | 1</td>
              <td>{isFr ? "Si « 1 », inclut la liste des longs week-ends." : "If '1', also include the list of long weekends."}</td>
            </tr>
          </tbody>
        </table>

        <h3>{isFr ? "Codes de province acceptés" : "Accepted province codes"}</h3>
        <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.7 }}>
          {provinceCodes.map((code) => (
            <li key={code}>
              <code>{code.replace("CA-", "").toLowerCase()}</code> · {provinceNames[code][locale]} · <code>{code}</code>
            </li>
          ))}
        </ul>

        <h3>{isFr ? "Exemples cURL" : "cURL examples"}</h3>
        <pre className="codeBlock"><code>{exampleHolidays}</code></pre>
        <pre className="codeBlock"><code>{exampleHolidaysWithLw}</code></pre>

        <h3>{isFr ? "Réponse type" : "Sample response"}</h3>
        <pre className="codeBlock"><code>{sampleResponse}</code></pre>
      </section>

      <section className="panel contentSection">
        <h2>GET <code>/api/week.json</code></h2>
        <p>
          {isFr
            ? "Renvoie le numéro de semaine actuel (ISO et Canada), les dates de la semaine, le jour de l'année, les jours fériés de la semaine et le prochain long week-end."
            : "Returns the current week number (ISO and Canada), week dates, day of the year, this week's holidays, and the next long weekend."}
        </p>
        <h3>{isFr ? "Paramètres de requête" : "Query parameters"}</h3>
        <table className="holidayTable">
          <thead>
            <tr>
              <th>{isFr ? "Nom" : "Name"}</th>
              <th>{isFr ? "Description" : "Description"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>province</code></td>
              <td>{isFr ? "Code province (optionnel)" : "Province code (optional)"}</td>
            </tr>
            <tr>
              <td><code>date</code></td>
              <td>{isFr ? "Date YYYY-MM-DD (par défaut : aujourd'hui)" : "Date YYYY-MM-DD (defaults to today)"}</td>
            </tr>
            <tr>
              <td><code>locale</code></td>
              <td>en | fr</td>
            </tr>
          </tbody>
        </table>
        <pre className="codeBlock"><code>{exampleWeekJson}</code></pre>
      </section>

      <section className="panel contentSection">
        <h2>GET <code>/api/holidays.ics</code></h2>
        <p>{isFr ? "Calendrier ICS prêt à importer dans Google, Apple, Outlook." : "Ready-to-import ICS calendar for Google, Apple, Outlook."}</p>
        <pre className="codeBlock"><code>{exampleIcs}</code></pre>
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Mise en cache & quotas" : "Caching & quotas"}</h2>
        <p>
          {isFr
            ? "Les réponses sont mises en cache au niveau Vercel pour 24 heures (s-maxage=86400) avec stale-while-revalidate. Côté client, 1 heure (max-age=3600). Cela suffit pour la plupart des intégrations."
            : "Responses are cached at the Vercel edge for 24h (s-maxage=86400) with stale-while-revalidate. Client cache is 1h (max-age=3600). This covers most integrations."}
        </p>
        <p>
          {isFr
            ? "Limites par défaut : 60 req/min/IP en anonyme, 600+/min avec une clé partenaire. Les en-têtes X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset et X-RateLimit-Bucket sont retournés sur chaque réponse."
            : "Default limits: 60 req/min/IP anonymous, 600+/min with a partner key. The X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, and X-RateLimit-Bucket headers are returned on every response."}
        </p>
        <p>
          <Link href={`/${locale}/api-keys`} prefetch={false}>
            {isFr ? "Demander une clé partenaire →" : "Request a partner key →"}
          </Link>
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
        <h2>{isFr ? "Voir aussi" : "See also"}</h2>
        <div className="linkGrid">
          <Link href={`/${locale}/code-snippets/iso-week-number`} prefetch={false}>{isFr ? "Code semaine ISO" : "ISO week code snippets"}</Link>
          <Link href={`/${locale}/api-keys`} prefetch={false}>{isFr ? "Clés API & limites" : "API keys & limits"}</Link>
          <Link href="/llms.txt">llms.txt</Link>
          <Link href={`/${locale}/about`} prefetch={false}>{isFr ? "À propos" : "About"}</Link>
          <Link href="https://date.nager.at/" prefetch={false}>Nager.Date</Link>
        </div>
      </section>
    </main>
  );
}
