import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildLocaleAlternates } from "@/lib/seo-metadata";

type Props = { params: Promise<{ locale: string }> };

type Snippet = {
  language: string;
  code: string;
  noteEn: string;
  noteFr: string;
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isFr = locale === "fr";
  const title = isFr ? "Numéro de semaine ISO 8601 — code (JS, Python, SQL, Excel)" : "ISO 8601 Week Number Code (JS, Python, SQL, Excel)";
  const description = isFr
    ? "Extraits de code prêts à coller pour calculer le numéro de semaine ISO 8601 en JavaScript, Python, PHP, Java, C#, Go, Rust, SQL, Excel et Google Sheets."
    : "Copy-paste code to compute the ISO 8601 week number in JavaScript, Python, PHP, Java, C#, Go, Rust, SQL, Excel, and Google Sheets.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    alternates: buildLocaleAlternates("/code-snippets/iso-week-number"),
    openGraph: { title, description, type: "website", url: `https://whatweek.ca/${locale}/code-snippets/iso-week-number`, locale: isFr ? "fr_CA" : "en_CA", images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

const snippets: Snippet[] = [
  {
    language: "JavaScript",
    code: `function isoWeek(date) {
  const d = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ));
  // Thursday in current week decides the year.
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

console.log(isoWeek(new Date())); // current ISO week number`,
    noteEn: "Pure ECMAScript, no dependencies. Returns 1–53.",
    noteFr: "ECMAScript pur, sans dépendance. Retourne 1–53.",
  },
  {
    language: "TypeScript (Intl-aware)",
    code: `// Intl.DateTimeFormat doesn't expose ISO weeks; use the formula above.
export function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

export function isoWeekYear(date: Date): number {
  const d = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.getUTCFullYear();
}`,
    noteEn: "Returns both the ISO week number and the ISO week-year.",
    noteFr: "Retourne le numéro de semaine ISO et l'année-semaine ISO.",
  },
  {
    language: "Python",
    code: `from datetime import date

# Python 3.9+: date.isocalendar() returns a named tuple
year, week, weekday = date.today().isocalendar()
print(f"{year}-W{week:02d}-{weekday}")`,
    noteEn: "isocalendar() returns ISO 8601 (year, week, weekday) since Python 3.9.",
    noteFr: "isocalendar() retourne un tuple ISO 8601 (année, semaine, jour) depuis Python 3.9.",
  },
  {
    language: "PHP",
    code: `<?php
$today = new DateTime("now", new DateTimeZone("America/Toronto"));
echo $today->format("o-\\WW"); // ISO week-year + ISO week, e.g. 2026-W18`,
    noteEn: "DateTime::format with `o` (ISO year) and `W` (ISO week).",
    noteFr: "DateTime::format avec `o` (année ISO) et `W` (semaine ISO).",
  },
  {
    language: "Java",
    code: `import java.time.LocalDate;
import java.time.temporal.WeekFields;

LocalDate today = LocalDate.now();
int week = today.get(WeekFields.ISO.weekOfWeekBasedYear());
int year = today.get(WeekFields.ISO.weekBasedYear());
System.out.printf("%d-W%02d%n", year, week);`,
    noteEn: "java.time.WeekFields.ISO is the standards-compliant accessor.",
    noteFr: "java.time.WeekFields.ISO est l'accesseur conforme à la norme.",
  },
  {
    language: "C#",
    code: `using System.Globalization;

var today = DateTime.UtcNow;
int week = ISOWeek.GetWeekOfYear(today);
int year = ISOWeek.GetYear(today);
Console.WriteLine($"{year}-W{week:D2}");`,
    noteEn: "System.Globalization.ISOWeek (.NET Core 3.0+).",
    noteFr: "System.Globalization.ISOWeek (.NET Core 3.0+).",
  },
  {
    language: "Go",
    code: `package main

import (
  "fmt"
  "time"
)

func main() {
  year, week := time.Now().UTC().ISOWeek()
  fmt.Printf("%d-W%02d\\n", year, week)
}`,
    noteEn: "time.Time.ISOWeek returns (year, week) in ISO 8601.",
    noteFr: "time.Time.ISOWeek retourne (année, semaine) selon ISO 8601.",
  },
  {
    language: "Rust (chrono)",
    code: `use chrono::{Datelike, Utc};

fn main() {
  let now = Utc::now().date_naive();
  let iso = now.iso_week();
  println!("{}-W{:02}", iso.year(), iso.week());
}`,
    noteEn: "chrono::NaiveDate::iso_week returns the ISO week.",
    noteFr: "chrono::NaiveDate::iso_week retourne la semaine ISO.",
  },
  {
    language: "Ruby",
    code: `require "date"
puts Date.today.cweek  # ISO 8601 week number
puts Date.today.cwyear # ISO 8601 week-year`,
    noteEn: "Date#cweek (calendar week) and Date#cwyear (calendar week year).",
    noteFr: "Date#cweek et Date#cwyear (norme ISO 8601).",
  },
  {
    language: "PostgreSQL",
    code: `SELECT
  EXTRACT(ISOYEAR  FROM CURRENT_DATE) AS iso_year,
  EXTRACT(WEEK    FROM CURRENT_DATE) AS iso_week;`,
    noteEn: "Postgres EXTRACT WEEK is ISO 8601 by default.",
    noteFr: "Postgres EXTRACT WEEK suit ISO 8601 par défaut.",
  },
  {
    language: "MySQL / MariaDB",
    code: `SELECT
  YEARWEEK(CURRENT_DATE, 3) AS iso_year_week, -- mode 3 = ISO 8601
  WEEK(CURRENT_DATE, 3)     AS iso_week;`,
    noteEn: "Mode 3 forces ISO 8601 (week 1 = first week with 4+ days).",
    noteFr: "Mode 3 force ISO 8601 (sem. 1 = première avec au moins 4 jours).",
  },
  {
    language: "SQL Server (T-SQL)",
    code: `SELECT
  DATEPART(ISO_WEEK, GETUTCDATE()) AS iso_week,
  DATEPART(YEAR, DATEADD(DAY, 26 - DATEPART(ISO_WEEK, GETUTCDATE()), GETUTCDATE())) AS iso_year;`,
    noteEn: "DATEPART(ISO_WEEK, ...) was added in SQL Server 2008.",
    noteFr: "DATEPART(ISO_WEEK, ...) ajouté à SQL Server 2008.",
  },
  {
    language: "BigQuery / Standard SQL",
    code: `SELECT
  EXTRACT(ISOWEEK FROM CURRENT_DATE())     AS iso_week,
  EXTRACT(ISOYEAR FROM CURRENT_DATE())     AS iso_year;`,
    noteEn: "Standard SQL ISOWEEK / ISOYEAR.",
    noteFr: "ISOWEEK / ISOYEAR du SQL standard.",
  },
  {
    language: "Excel",
    code: `=ISOWEEKNUM(TODAY())
=YEAR(TODAY()-WEEKDAY(TODAY(),3)+3)  ' ISO week-year
="W" & TEXT(ISOWEEKNUM(TODAY()),"00")`,
    noteEn: "Excel 2013+ has ISOWEEKNUM. Older versions need a manual formula.",
    noteFr: "Excel 2013+ inclut ISOWEEKNUM. Versions antérieures: formule manuelle.",
  },
  {
    language: "Google Sheets",
    code: `=ISOWEEKNUM(TODAY())
=YEAR(TODAY()-WEEKDAY(TODAY(),3)+3)`,
    noteEn: "ISOWEEKNUM is supported natively.",
    noteFr: "ISOWEEKNUM pris en charge nativement.",
  },
];

export default async function CodeSnippetsPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";

  const faq = [
    {
      question: isFr ? "Pourquoi ISO 8601 plutôt qu'un autre système ?" : "Why ISO 8601 instead of another system?",
      answer: isFr
        ? "ISO 8601 est la norme internationale pour les numéros de semaine. Il définit clairement quand une semaine commence (lundi) et comment compter la semaine 1."
        : "ISO 8601 is the international standard for week numbering. It defines unambiguously when a week starts (Monday) and how week 1 is counted.",
    },
    {
      question: isFr ? "Quels langages prennent en charge ISO 8601 nativement ?" : "Which languages support ISO 8601 natively?",
      answer: isFr
        ? "Java, C# (>= .NET Core 3), Python (>= 3.9), Go, Ruby, Rust avec chrono, et la plupart des SGBD modernes (Postgres, MySQL avec mode 3, SQL Server 2008+, BigQuery)."
        : "Java, C# (>= .NET Core 3), Python (>= 3.9), Go, Ruby, Rust with chrono, and most modern databases (Postgres, MySQL with mode 3, SQL Server 2008+, BigQuery).",
    },
    {
      question: isFr ? "Excel donne-t-il le bon numéro de semaine ?" : "Does Excel return the right week number?",
      answer: isFr
        ? "Excel WEEKNUM utilise par défaut le système américain. Utilisez ISOWEEKNUM (Excel 2013+) ou la formule lundi-jeudi pour obtenir le résultat ISO 8601."
        : "Excel's WEEKNUM defaults to the US system. Use ISOWEEKNUM (Excel 2013+) or the Monday-Thursday formula to get ISO 8601.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const techArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: isFr ? "Numéro de semaine ISO 8601 — extraits de code" : "ISO 8601 Week Number Code Snippets",
    description: isFr ? "Extraits prêts à coller dans 15 langages." : "Copy-paste snippets in 15 languages.",
    inLanguage: isFr ? "fr-CA" : "en-CA",
    proficiencyLevel: "Beginner",
    mainEntityOfPage: `https://whatweek.ca/${locale}/code-snippets/iso-week-number`,
  };
  const graphJsonLd = { "@context": "https://schema.org", "@graph": [buildBreadcrumbJsonLd(locale, [{ name: isFr ? "Code semaine ISO" : "ISO week code", path: "/code-snippets/iso-week-number" }]), faqJsonLd, techArticleJsonLd] };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main id="main-content" className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{isFr ? "Extraits de code" : "Code snippets"}</span>
        </nav>
        <h1>{isFr ? "Numéro de semaine ISO 8601 — extraits de code" : "ISO 8601 Week Number Code Snippets"}</h1>
        <p className="subtle heroLead">
          {isFr
            ? "15 langages, prêts à coller. Calculez le numéro de semaine ISO 8601 et l'année-semaine ISO en JavaScript, Python, SQL, Excel, et plus."
            : "15 languages, copy-paste ready. Compute the ISO 8601 week number and ISO week-year in JavaScript, Python, SQL, Excel, and more."}
        </p>
      </section>

      {snippets.map((snippet) => (
        <section key={snippet.language} className="panel contentSection">
          <h2>{snippet.language}</h2>
          <p className="subtle" style={{ marginTop: 0 }}>{isFr ? snippet.noteFr : snippet.noteEn}</p>
          <pre className="codeBlock"><code>{snippet.code}</code></pre>
        </section>
      ))}

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
        <h2>{isFr ? "Outils liés" : "Related tools"}</h2>
        <div className="linkGrid">
          <Link href={`/${locale}/iso-week-number-canada`} prefetch={false}>{isFr ? "Semaine ISO Canada" : "ISO week Canada"}</Link>
          <Link href={`/${locale}/iso-week-to-date`} prefetch={false}>{isFr ? "Semaine ISO → date" : "ISO week → date"}</Link>
          <Link href={`/${locale}/date-to-week`} prefetch={false}>{isFr ? "Date ↔ semaine" : "Date ↔ week"}</Link>
          <Link href={`/${locale}/api-docs`} prefetch={false}>{isFr ? "Documentation API" : "API documentation"}</Link>
        </div>
      </section>
    </main>
  );
}
