import { ImageResponse } from "next/og";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export const alt = "Business Days Calculator - WhatWeek.ca";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeInput } = await params;
  const locale: Locale = isLocale(localeInput) ? localeInput : "en";
  const dictionary = getDictionary(locale);
  
  const isFr = locale === "fr";
  const title = isFr ? "Jours Ouvrables" : "Business Days";
  const subtitle = isFr ? "Calculatrice Canada" : "Canadian Calculator";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #ffffff, #f8fafc)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          borderTop: "24px solid #e11d48",
        }}
      >
        <div style={{ fontSize: 60, color: "#64748b", marginBottom: 20, letterSpacing: "-1px" }}>
          {dictionary.title()}
        </div>
        <div style={{ 
          fontSize: 120, 
          fontWeight: 900, 
          color: "#e11d48", 
          display: "flex", 
          alignItems: "center",
          letterSpacing: "-4px",
          textAlign: "center"
        }}>
          {title}
        </div>
        <div style={{ fontSize: 48, color: "#94a3b8", marginTop: 20 }}>
          {subtitle}
        </div>
        <div style={{ 
          fontSize: 40, 
          color: "#be123c", 
          marginTop: 60, 
          background: "#ffe4e6", 
          padding: "12px 40px", 
          borderRadius: 100,
          fontWeight: "bold"
        }}>
          whatweek.ca
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
