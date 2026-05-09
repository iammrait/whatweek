import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { getKeywordSnapshot, keywordPageOrder, keywordPages, type KeywordPageKey } from "@/lib/keyword-targets";
import { buildFaqJsonLd, buildLocaleAlternates } from "@/lib/seo-metadata";
import { getSeoOverride } from "@/lib/seo-overrides";

type Props = {
  params: Promise<{ locale: string; keywordSlug: string }>;
};

function isKeywordPageKey(value: string): value is KeywordPageKey {
  return keywordPageOrder.includes(value as KeywordPageKey);
}

function buildAbsolute(locale: Locale, slug: KeywordPageKey): string {
  return `https://whatweek.ca/${locale}/${slug}`;
}

export function generateStaticParams() {
  return locales.flatMap((locale) => keywordPageOrder.map((keywordSlug) => ({ locale, keywordSlug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, keywordSlug } = await params;
  if (!isLocale(locale) || !isKeywordPageKey(keywordSlug)) return {};

  const page = keywordPages[keywordSlug];
  const canonical = buildAbsolute(locale, keywordSlug);
  const override = getSeoOverride(`/${locale}/${keywordSlug}`);
  const title = override?.title ?? page.title(locale);
  const description = override?.description ?? page.description(locale);
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ...buildLocaleAlternates(`/${keywordSlug}`).languages,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
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

export default async function KeywordIntentPage({ params }: Props) {
  const { locale: localeInput, keywordSlug } = await params;
  if (!isLocale(localeInput) || !isKeywordPageKey(keywordSlug)) notFound();
  const locale: Locale = localeInput;
  const page = keywordPages[keywordSlug];
  const snapshot = getKeywordSnapshot();
  const todayLabel = new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(snapshot.today);

  const canonical = buildAbsolute(locale, keywordSlug);
  const faq = page.faq(locale, snapshot.currentYear, snapshot.canadaWeek, snapshot.dayOfYear, snapshot.weekYear);
  const bodySections = page.bodySections?.(locale, snapshot) ?? [];
  const related = keywordPageOrder.filter((item) => item !== keywordSlug).slice(0, 6);

  const faqJsonLd = buildFaqJsonLd(faq);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: related.map((slug, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: keywordPages[slug].h1(locale),
      url: buildAbsolute(locale, slug),
    })),
  };

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [faqJsonLd, itemListJsonLd],
  };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} />
      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>
            {locale === "fr" ? "Accueil" : "Home"}
          </Link>
          <span> / </span>
          <span>{page.h1(locale)}</span>
        </nav>
        <h1>{page.h1(locale)}</h1>
        <p className="subtle" style={{ maxWidth: "860px", margin: "0.75rem auto 0", lineHeight: 1.6 }}>
          {page.intro(locale)}
        </p>
        <p className="subtle" style={{ maxWidth: "860px", margin: "0.5rem auto 0", lineHeight: 1.6 }}>
          {locale === "fr"
            ? `Aujourd'hui : ${todayLabel}. Semaine Canada ${snapshot.canadaWeek}, semaine ISO ${snapshot.isoWeek}, jour ${snapshot.dayOfYear} de l'année ${snapshot.currentYear}.`
            : `Today: ${todayLabel}. Canada week ${snapshot.canadaWeek}, ISO week ${snapshot.isoWeek}, day ${snapshot.dayOfYear} of ${snapshot.currentYear}.`}
        </p>
        <p className="subtle" style={{ maxWidth: "860px", margin: "0.5rem auto 0", lineHeight: 1.6 }}>
          {locale === "fr" ? `Année-semaine ISO actuelle: ${snapshot.weekYear}-W${String(snapshot.isoWeek).padStart(2, "0")}.` : `Current ISO week-year: ${snapshot.weekYear}-W${String(snapshot.isoWeek).padStart(2, "0")}.`}
        </p>
      </section>

      {bodySections.length > 0 && (
        <section className="panel contentSection">
          {bodySections.map((section) => (
            <article key={section.h2} style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ marginBottom: "0.4rem" }}>{section.h2}</h2>
              <p>{section.paragraph}</p>
              {section.h3?.map((sub) => (
                <div key={sub.heading} style={{ marginTop: "0.6rem" }}>
                  <h3 style={{ marginBottom: "0.3rem" }}>{sub.heading}</h3>
                  <p>{sub.paragraph}</p>
                </div>
              ))}
            </article>
          ))}
        </section>
      )}

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "Questions fréquentes" : "Frequently asked questions"}</h2>
        {faq.map((entry) => (
          <article key={entry.question} style={{ marginBottom: "0.9rem" }}>
            <h3 style={{ marginBottom: "0.4rem" }}>{entry.question}</h3>
            <p>{entry.answer}</p>
          </article>
        ))}
      </section>

      <section className="panel quickLinks">
        <h2>{locale === "fr" ? "Outils de semaine liés" : "Related week tools"}</h2>
        <div className="linkGrid">
          <Link href={`/${locale}/current-week-number-canada`} prefetch={false}>
            {locale === "fr" ? "Semaine actuelle au Canada" : "Current week number in Canada"}
          </Link>
          <Link href={`/${locale}/iso-week-number-canada`} prefetch={false}>
            {locale === "fr" ? "Semaine ISO au Canada" : "ISO week number in Canada"}
          </Link>
          <Link href={`/${locale}/calendar/${snapshot.currentYear}`} prefetch={false}>
            {locale === "fr" ? `Calendrier ${snapshot.currentYear}` : `${snapshot.currentYear} calendar`}
          </Link>
          <Link href={`/${locale}/week/${snapshot.weekYear}/${snapshot.isoWeek}`} prefetch={false}>
            {locale === "fr" ? `Détail semaine ${snapshot.isoWeek}` : `Week ${snapshot.isoWeek} details`}
          </Link>
          {related.slice(0, 2).map((slug) => (
            <Link key={slug} href={`/${locale}/${slug}`} prefetch={false}>
              {keywordPages[slug].h1(locale)}
            </Link>
          ))}
        </div>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? "URL canonique" : "Canonical URL"}</h2>
        <p>
          <a href={canonical}>{canonical}</a>
        </p>
      </section>
    </main>
  );
}
