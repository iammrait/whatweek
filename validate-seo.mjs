import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

function read(relativePath) {
  const fullPath = resolve(root, relativePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
  return readFileSync(fullPath, "utf8");
}

function assertIncludes(file, text, label) {
  if (!file.includes(text)) {
    throw new Error(`Missing ${label}`);
  }
}

const metadataFiles = [
  "src/app/[locale]/calendar/[year]/page.tsx",
  "src/app/[locale]/week/[year]/[week]/page.tsx",
  "src/app/[locale]/current-week-number-canada/page.tsx",
  "src/app/[locale]/iso-week-number-canada/page.tsx",
];

for (const relativePath of metadataFiles) {
  const source = read(relativePath);
  assertIncludes(source, "alternates:", `${relativePath} alternates`);
  assertIncludes(source, "openGraph:", `${relativePath} openGraph`);
  assertIncludes(source, "twitter:", `${relativePath} twitter`);
  assertIncludes(source, '"x-default"', `${relativePath} x-default hreflang`);
}

const homePage = read("src/app/[locale]/page.tsx");
assertIncludes(homePage, '"@type": "Organization"', "Organization JSON-LD");
assertIncludes(homePage, "sameAs", "Organization sameAs for entity graph");
assertIncludes(homePage, '"@type": "WebPage"', "WebPage JSON-LD");
assertIncludes(homePage, "date.nager.at", "holiday source provenance");

const sitemap = read("src/app/sitemap.ts");
assertIncludes(sitemap, "MIN_YEAR", "sitemap min year bound");
assertIncludes(sitemap, "MAX_YEAR", "sitemap max year bound");
assertIncludes(sitemap, "generateSitemaps", "segmented sitemap ids");
assertIncludes(sitemap, "startOfIsoWeek", "week-based lastModified logic");

const sitemapIndexRoute = read("src/app/sitemap-index/route.ts");
assertIncludes(sitemapIndexRoute, "sitemapindex", "sitemap index XML route");
assertIncludes(sitemapIndexRoute, "generateSitemaps", "sitemap index uses same bucket list");

const llms = read("public/llms.txt");
assertIncludes(llms, "site: https://whatweek.ca", "llms site declaration");
assertIncludes(llms, "https://blog.whatweek.ca/", "llms blog subdomain");
assertIncludes(llms, "citations:", "llms citation guidance");

console.log("SEO validation checks passed.");
