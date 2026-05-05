import { NextResponse } from "next/server";
import { generateSitemaps } from "@/app/sitemap";

const BASE_URL = "https://whatweek.ca";

/**
 * Sitemap index listing all `/sitemap/{id}.xml` buckets from `generateSitemaps`.
 * Public URL is `/sitemap.xml` via rewrite in `next.config.ts`.
 */
export async function GET() {
  const buckets = await generateSitemaps();
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...buckets.map(
      (item) =>
        `  <sitemap><loc>${BASE_URL}/sitemap/${encodeURIComponent(String(item.id))}.xml</loc></sitemap>`,
    ),
    "</sitemapindex>",
  ].join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
