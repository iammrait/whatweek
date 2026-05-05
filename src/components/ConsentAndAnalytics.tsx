"use client";

import Script from "next/script";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ww_analytics_consent";

type ConsentState = "pending" | "granted" | "denied" | "unset";

type Props = {
  bannerText: string;
  acceptLabel: string;
  declineLabel: string;
  gaMeasurementId: string;
  ahrefsDataKey: string;
};

export function ConsentAndAnalytics({
  bannerText,
  acceptLabel,
  declineLabel,
  gaMeasurementId,
  ahrefsDataKey,
}: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [consent, setConsent] = useState<ConsentState>("pending");

  const accept = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setConsent("granted");
  }, []);

  const decline = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "0");
    setConsent("denied");
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setConsent("granted");
    else if (stored === "0") setConsent("denied");
    else setConsent("unset");
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  if (consent === "granted") {
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}');
          `}
        </Script>
        <Script src="https://analytics.ahrefs.com/analytics.js" data-key={ahrefsDataKey} strategy="lazyOnload" />
      </>
    );
  }

  if (consent === "denied") {
    return null;
  }

  return (
    <div className="cookieBanner" role="dialog" aria-live="polite" aria-label="Analytics consent">
      <p className="cookieBannerText">{bannerText}</p>
      <div className="cookieBannerActions">
        <button type="button" className="cookieBtn cookieBtnPrimary" onClick={accept}>
          {acceptLabel}
        </button>
        <button type="button" className="cookieBtn" onClick={decline}>
          {declineLabel}
        </button>
      </div>
    </div>
  );
}
