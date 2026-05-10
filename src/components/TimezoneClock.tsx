"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  ianaTimeZone: string;
  initialTimeIso: string;
  initialOffsetMinutes: number;
};

function getTzOffsetMinutes(timeZone: string, now: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  });
  const parts = dtf.formatToParts(now);
  const tz = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(tz);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  return sign * (hours * 60 + minutes);
}

function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? "−" : "+";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0 ? `UTC${sign}${h}` : `UTC${sign}${h}:${String(m).padStart(2, "0")}`;
}

export function TimezoneClock({ locale, ianaTimeZone, initialTimeIso, initialOffsetMinutes }: Props) {
  const isFr = locale === "fr";
  const localeCode = isFr ? "fr-CA" : "en-CA";
  const [now, setNow] = useState<Date>(() => new Date(initialTimeIso));
  const [offsetMinutes, setOffsetMinutes] = useState<number>(initialOffsetMinutes);

  useEffect(() => {
    const id = window.setInterval(() => {
      const current = new Date();
      setNow(current);
      setOffsetMinutes(getTzOffsetMinutes(ianaTimeZone, current));
    }, 1000);
    return () => window.clearInterval(id);
  }, [ianaTimeZone]);

  const timeFmt = new Intl.DateTimeFormat(localeCode, {
    timeZone: ianaTimeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const dateFmt = new Intl.DateTimeFormat(localeCode, {
    timeZone: ianaTimeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="contentSection" aria-live="polite">
      <p className="subtle" style={{ margin: 0 }}>
        {isFr ? "Heure actuelle" : "Current time"}
      </p>
      <div style={{ fontSize: "2.5rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
        {timeFmt.format(now)}
      </div>
      <p style={{ margin: "0.25rem 0 0" }}>{dateFmt.format(now)}</p>
      <p className="subtle" style={{ marginTop: "0.25rem", fontSize: "0.9rem" }}>
        {isFr
          ? `Décalage actuel : ${formatOffset(offsetMinutes)}`
          : `Current offset: ${formatOffset(offsetMinutes)}`}
      </p>
    </div>
  );
}
