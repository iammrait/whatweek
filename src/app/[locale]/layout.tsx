import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConsentAndAnalytics } from "@/components/ConsentAndAnalytics";
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
    default: "What Week Is It? — Canada Week Number Calendar | WhatWeek.ca",
    template: "%s | WhatWeek.ca",
  },
  description:
    "Find the current week number in Canada. Free bilingual (English & French) calendar with ISO 8601 week numbers, Canadian holidays, and long weekend tracking by province.",
  category: "calendar",
  authors: [{ name: "whatweek.ca" }],
  creator: "whatweek.ca",
  publisher: "whatweek.ca",
  verification: {
    google: "-1kAoDQ7unIxAkV5bPCkChU32yBHLe9FSqXp0uGZhf4",
    yandex: "71d354bd6770d616",
    other: {
      "msvalidate.01": "1ABB4698830808FB5C2E81CF22FA73AF",
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
      <body>
        <ConsentAndAnalytics
          bannerText={d.cookieBannerText}
          acceptLabel={d.cookieAccept}
          declineLabel={d.cookieDecline}
          gaMeasurementId="G-G5NQRCTLPC"
          ahrefsDataKey="IMDOwtpPpFNiBLHGoA1t4Q"
        />
        {children}
      </body>
    </html>
  );
}
