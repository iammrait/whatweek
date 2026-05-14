import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { buildLocaleAlternates } from "@/lib/seo-metadata";
import { buildBreadcrumbJsonLd } from "@/lib/seo-metadata";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isFr = locale === "fr";
  const title = isFr
    ? "Clés API et limites — WhatWeek.ca"
    : "API keys & rate limits — WhatWeek.ca";
  const description = isFr
    ? "Demandez une clé API gratuite pour /api/holidays.json et /api/week.json. Limites anonymes et limites partenaires expliquées."
    : "Request a free API key for /api/holidays.json and /api/week.json. Anonymous limits and partner limits explained.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    keywords: isFr
      ? ["api jours fériés canada", "clé api whatweek", "limites api", "développeur api canada", "calendrier api", "données fériés"]
      : ["canada holidays api", "whatweek api key", "rate limits", "api developer canada", "calendar api", "holiday data"],
    alternates: buildLocaleAlternates("/api-keys"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://whatweek.ca/${locale}/api-keys`,
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

export default async function ApiKeysPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";
  const mailto = `mailto:hello@whatweek.ca?subject=${encodeURIComponent(
    isFr ? "Demande de clé API WhatWeek" : "WhatWeek API key request",
  )}&body=${encodeURIComponent(
    isFr
      ? "Bonjour,\n\nNom :\nProjet / site :\nVolume estimé (req/min) :\nUsage prévu :\n\nMerci !"
      : "Hi,\n\nName:\nProject / site:\nEstimated volume (req/min):\nPlanned usage:\n\nThanks!",
  )}`;

  return (
    <main id="main-content" className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(locale, [{ name: isFr ? "Clés API" : "API keys", path: "/api-keys" }])) }} />
      <SiteHeader locale={locale} />
      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <Link href={`/${locale}/api-docs`} prefetch={false}>API</Link>
          <span> / </span>
          <span>{isFr ? "Clés API" : "API keys"}</span>
        </nav>
        <h1>{isFr ? "Clés API & limites de débit" : "API keys & rate limits"}</h1>
        <p className="subtle heroLead">
          {isFr
            ? "Notre API publique est gratuite et sans clé pour un usage modéré. Pour des volumes plus élevés, demandez une clé partenaire — c'est gratuit pour les usages non commerciaux."
            : "Our public API is free and key-less for light use. For higher volume, request a free partner key — non-commercial uses included."}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Limites par défaut" : "Default limits"}</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">{isFr ? "Type d'accès" : "Access tier"}</th>
              <th scope="col">{isFr ? "Limite par minute" : "Per-minute limit"}</th>
              <th scope="col">{isFr ? "Mode" : "Mode"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{isFr ? "Anonyme (par IP)" : "Anonymous (per IP)"}</td>
              <td>60</td>
              <td>{isFr ? "Aucune clé requise" : "No key required"}</td>
            </tr>
            <tr>
              <td>{isFr ? "Clé partenaire" : "Partner key"}</td>
              <td>600+</td>
              <td>
                <code>X-API-Key</code> {isFr ? "ou" : "or"} <code>?api_key=</code>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="subtle" style={{ marginTop: "0.75rem" }}>
          {isFr
            ? "Les en-têtes X-RateLimit-Limit, X-RateLimit-Remaining et X-RateLimit-Reset sont retournés sur chaque réponse. En cas de dépassement, l'API retourne 429 avec un en-tête Retry-After."
            : "Headers X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset are returned on every response. When exceeded, the API returns 429 with a Retry-After header."}
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Comment authentifier" : "How to authenticate"}</h2>
        <p>
          {isFr
            ? "Une fois votre clé reçue, envoyez-la dans l'en-tête X-API-Key, dans Authorization: Bearer <clé>, ou en paramètre de requête api_key=."
            : "Once you receive your key, send it as the X-API-Key header, an Authorization: Bearer <key> header, or an api_key= query parameter."}
        </p>
        <pre className="codeBlock">
          <code>{`# Header (recommended)
curl -H "X-API-Key: $WHATWEEK_KEY" \\
  "https://whatweek.ca/api/holidays.json?province=on&year=2026"

# Query parameter
curl "https://whatweek.ca/api/week.json?api_key=$WHATWEEK_KEY"`}</code>
        </pre>
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Demander une clé" : "Request a key"}</h2>
        <p>
          {isFr
            ? "Envoyez-nous un courriel avec votre nom, votre projet et le volume estimé. Nous répondons généralement sous 48 heures."
            : "Email us your name, project, and estimated volume. We typically reply within 48 hours."}
        </p>
        <p style={{ marginTop: "0.75rem" }}>
          <a className="ctaButton" href={mailto}>
            {isFr ? "Envoyer la demande" : "Send request email"}
          </a>
        </p>
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Bonnes pratiques" : "Best practices"}</h2>
        <ul>
          <li>{isFr ? "Mettez en cache les réponses côté client (les fériés changent rarement)." : "Cache responses on your side — holidays rarely change."}</li>
          <li>{isFr ? "Respectez l'en-tête Retry-After lorsque vous recevez 429." : "Respect the Retry-After header when you receive a 429."}</li>
          <li>{isFr ? "Ne partagez pas votre clé publiquement (pas de front-end exposé)." : "Don't expose your key in client-side code or public repos."}</li>
          <li>{isFr ? "Identifiez-vous via un User-Agent descriptif." : "Identify yourself with a descriptive User-Agent."}</li>
        </ul>
      </section>

      <section className="panel quickLinks">
        <h2>{isFr ? "Voir aussi" : "See also"}</h2>
        <div className="linkGrid">
          <Link href={`/${locale}/api-docs`} prefetch={false}>
            {isFr ? "Documentation API" : "API documentation"}
          </Link>
          <Link href={`/api/holidays.json?province=on`} prefetch={false}>
            {isFr ? "Exemple holidays.json" : "Sample holidays.json"}
          </Link>
          <Link href={`/api/week.json`} prefetch={false}>
            {isFr ? "Exemple week.json" : "Sample week.json"}
          </Link>
        </div>
      </section>
    </main>
  );
}
