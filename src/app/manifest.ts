import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WhatWeek.ca — Canada week calendar",
    short_name: "WhatWeek",
    description:
      "Canada's bilingual week-number calendar with statutory holidays, long weekends, and pay-period tools.",
    start_url: "/en",
    scope: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#e11d48",
    lang: "en-CA",
    orientation: "any",
    categories: ["productivity", "utilities", "business"],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Current week",
        url: "/en",
      },
      {
        name: "Business days calculator",
        url: "/en/business-days-calculator",
      },
      {
        name: "Long weekends",
        url: `/en/long-weekends/${new Date().getUTCFullYear()}`,
      },
    ],
  };
}
