# WordPress blog checklist (blog.whatweek.ca)

Use this on the WordPress host for [blog.whatweek.ca](https://blog.whatweek.ca/). The main app at [whatweek.ca](https://whatweek.ca/) links to the blog and lists `sameAs` in Organization JSON-LD.

## Technical

- Force **HTTPS** and a single preferred hostname (`blog.whatweek.ca`); redirect `www` or apex if they exist.
- Keep WordPress, themes, and plugins updated.

## SEO plugin (Yoast, Rank Math, or similar)

- Enable **XML sitemaps**; note the sitemap URL (often `/wp-sitemap.xml` or `/sitemap_index.xml`).
- Submit that sitemap in **Google Search Console** (domain property on `whatweek.ca` usually includes the subdomain).
- Enable **Article / BlogPosting** structured data where the plugin supports it.
- Set canonical URLs, Open Graph, and Twitter cards for posts.
- Configure **breadcrumbs** (optional but useful for internal linking).

## Content

- Replace default “Hello world” with **real articles** (guides, FAQs, payroll/school context)—thin duplicates of tool pages add little value.
- Use clear **H1** (one per post) and question-style **H2**s where natural.
- Add **featured images** and meaningful **alt** text.
- Link from posts back to canonical tool URLs on **whatweek.ca** (e.g. week detail, current week) when relevant.

## AI / LLM crawlers (policy)

- Decide whether to allow **GPTBot**, **Google-Extended**, etc., in the blog’s `robots.txt` (separate from the Next.js app).
- The main site’s [`public/llms.txt`](../public/llms.txt) lists the blog under `allowed:`; keep WordPress behavior aligned with your policy.

## After launch

- Test a few posts in Google’s **Rich Results Test**.
- Confirm `https://blog.whatweek.ca/wp-json/wp/v2/posts` returns JSON so the Next.js **BlogTeaser** can fetch latest posts (or set `BLOG_WP_ORIGIN` in `.env` if the API base differs).
