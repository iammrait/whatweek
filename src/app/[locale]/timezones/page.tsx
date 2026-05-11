import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { buildBreadcrumbJsonLd, buildLocaleAlternates } from "@/lib/seo-metadata";
import {
  canadianTimezoneSlugs,
  canadianTimezones,
  getTimezoneName,
  getTimezoneRegions,
} from "@/lib/timezones-ca";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isFr = locale === "fr";
  const title = isFr
    ? "Fuseaux horaires du Canada — heure et numéros de semaine"
    : "Canadian time zones — current time & week numbers";
  const description = isFr
    ? "Heure en direct et numéros de semaine ISO 8601 pour les six fuseaux horaires du Canada : Pacifique, Rocheuses, Centre, Est, Atlantique, Terre-Neuve."
    : "Live time and ISO 8601 week numbers for all six Canadian time zones: Pacific, Mountain, Central, Eastern, Atlantic, Newfoundland.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    keywords: isFr
      ? ["fuseaux horaires canada", "heure canada", "semaine iso canada", "décalage horaire", "heure pacifique", "heure de l'est"]
      : ["canada time zones", "current time canada", "iso week canada", "time difference", "pacific time", "eastern time"],
    alternates: buildLocaleAlternates("/timezones"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://whatweek.ca/${locale}/timezones`,
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

export default async function TimezonesIndexPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(locale, [{ name: isFr ? "Fuseaux horaires" : "Time zones", path: "/timezones" }])) }} />
      <SiteHeader locale={locale} />
      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{isFr ? "Fuseaux horaires" : "Time zones"}</span>
        </nav>
        <h1>{isFr ? "Fuseaux horaires du Canada" : "Canadian time zones"}</h1>
        <p className="subtle heroLead">
          {isFr
            ? "Le Canada compte six fuseaux horaires. Cliquez sur un fuseau pour voir l'heure actuelle, le numéro de semaine et les provinces concernées."
            : "Canada has six time zones. Pick one to see the current time, week number, and the provinces it covers."}
        </p>
      </section>

      <section className="panel">
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.75rem" }}>
          {canadianTimezoneSlugs.map((slug) => {
            const tz = canadianTimezones[slug];
            const regions = getTimezoneRegions(tz, locale);
            return (
              <li key={slug} style={{ borderBottom: "1px solid var(--line)", paddingBottom: "0.75rem" }}>
                <Link href={`/${locale}/timezones/${slug}`} prefetch={false} style={{ fontWeight: 600 }}>
                  {getTimezoneName(tz, locale)}
                </Link>
                <p className="subtle" style={{ margin: "0.2rem 0 0", fontSize: "0.9rem" }}>
                  {tz.utcOffsetStandard} / {tz.utcOffsetDaylight} · {regions.join(" · ")}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
