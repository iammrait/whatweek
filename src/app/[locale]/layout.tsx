import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConsentAndAnalytics } from "@/components/ConsentAndAnalytics";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { themeBootstrapScript } from "@/components/ThemeToggle";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://whatweek.ca"),
  applicationName: "WhatWeek.ca",
  title: {
    default: "Current Week Number Canada | WhatWeek.ca",
    template: "%s | WhatWeek.ca",
  },
  description:
    "Instantly see what week of the year it is in Canada. View the current week number, weeks into the year, day of the year and full calendar.",
  category: "calendar",
  authors: [{ name: "whatweek.ca" }],
  creator: "whatweek.ca",
  publisher: "whatweek.ca",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  verification: {
    google: "-1kAoDQ7unIxAkV5bPCkChU32yBHLe9FSqXp0uGZhf4",
    yandex: "71d354bd6770d616",
    other: {
      "msvalidate.01": "1ABB4698830808FB5C2E81CF22FA73AF",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeInput } = await params;
  const lang = localeInput === "fr" ? "fr-CA" : "en-CA";
  const locale: Locale = isLocale(localeInput) ? localeInput : "en";
  const d = getDictionary(locale);

  return (
    <html lang={lang} className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        {/* Geist is self-hosted via next/font; no google fonts connection needed */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://analytics.ahrefs.com" />
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          title="WhatWeek.ca"
          href="/opensearch.xml"
        />
        <meta name="theme-color" content="#e11d48" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0b1220" media="(prefers-color-scheme: dark)" />
      </head>
      <body>
        {/* Inline bootstrap before other body nodes — avoids a parser-blocking script in <head> */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <a className="skipToContent" href="#main-content">
          {d.skipToContent}
        </a>
        <ConsentAndAnalytics
          bannerText={d.cookieBannerText}
          acceptLabel={d.cookieAccept}
          declineLabel={d.cookieDecline}
          gaMeasurementId="G-G5NQRCTLPC"
          ahrefsDataKey="IMDOwtpPpFNiBLHGoA1t4Q"
        />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
