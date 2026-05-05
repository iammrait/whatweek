import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { HtmlLangUpdater } from "@/components/HtmlLangUpdater";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  const { locale } = await params;
  const lang = locale === "fr" ? "fr-CA" : "en-CA";

  return (
    <html lang={lang} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-G5NQRCTLPC"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-G5NQRCTLPC');
          `}
        </Script>
        <Script
          async
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="IMDOwtpPpFNiBLHGoA1t4Q"
        />
        <HtmlLangUpdater />
        {children}
      </body>
    </html>
  );
}
