import { ImageResponse } from "next/og";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { getIsoWeekNumber, getTodayInTimeZone } from "@/lib/week";

export const alt = "WhatWeek.ca";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeInput } = await params;
  const locale: Locale = isLocale(localeInput) ? localeInput : "en";
  const dictionary = getDictionary(locale);
  
  const currentWeek = getIsoWeekNumber(getTodayInTimeZone(defaultCanadaTimeZone));

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
        <div style={{ fontSize: 72, color: "#64748b", marginBottom: 40, letterSpacing: "-2px" }}>
          {dictionary.title()}
        </div>
        <div style={{ 
          fontSize: 180, 
          fontWeight: 900, 
          color: "#e11d48", 
          display: "flex", 
          alignItems: "center",
          letterSpacing: "-4px" 
        }}>
          {dictionary.weekAbbrev} {currentWeek}
        </div>
        <div style={{ 
          fontSize: 48, 
          color: "#be123c", 
          marginTop: 60, 
          background: "#ffe4e6", 
          padding: "16px 48px", 
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
