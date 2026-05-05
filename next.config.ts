import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      // `app/sitemap.ts` + `generateSitemaps` serves children at `/sitemap/{id}.xml` only.
      // Expose a standard index at `/sitemap.xml` without conflicting with metadata routing.
      { source: "/sitemap.xml", destination: "/sitemap-index" },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/en",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
