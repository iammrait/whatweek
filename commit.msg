Add 5 new tools, PWA support, dark mode, JSON API, and ICS calendar feeds

Tier 1 - New tools:
- Date to Week converter (/date-to-week)
- Business days calculator (/business-days-calculator)
- Pay period calculator (/pay-period-calculator)
- Long weekends page (/long-weekends/[year])
- Per-province statutory holidays (/statutory-holidays/[province]/[year])
- iCalendar API feed (/api/holidays.ics) with webcal support

Tier 2 - Developer and API:
- Public JSON API (/api/week.json)
- Embeddable widget (/embed + /embed/week)
- PWA: manifest, service worker, icon, theme-color meta
- Dark/light/auto theme toggle with flash prevention
- OpenSearch support (/opensearch.xml)

Tier 3 - SEO cleanup:
- Sitemap expanded for all new routes
- Query param redirects: ?year= to /calendar/{year} with nofollow
- JSON-LD consolidated into single @graph script per page (React 19 compatible)

Bug fixes:
- ThemeToggle: replaced setState-in-useEffect with lazy initializer
- holidays-ca.ts: removed unstable_cache causing RSC serialization failures