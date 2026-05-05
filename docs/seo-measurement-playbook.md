# SEO Measurement Playbook (Canada Keywords)

This playbook tracks the new Canada-first keyword landing pages and supports the 4-8 week ranking sprint.

## Target pages

- `/en/what-week-of-the-year-is-it`
- `/en/what-year-week-is-it`
- `/en/weeks-in-a-year`
- `/en/what-day-of-the-year-is-it`
- `/en/what-day-of-the-week`
- `/en/weeks-and-months`
- `/en/year-by-calendar`
- `/en/week-by-year`

French equivalents should be monitored in parallel.

## Search Console setup

1. In Performance, create a page filter for each target URL and save it.
2. Track metrics weekly:
   - Clicks
   - Impressions
   - Average CTR
   - Average position
3. Create a query regex group for cluster monitoring:
   - `what week|week of the year|week today|what year week|weeks in a year|how many weeks|day of the year|day of the week|weeks and months|year by calendar|week by year`

## Weekly operating loop

1. Check index coverage for all new URLs.
2. Compare winners/losers by CTR and average position.
3. For pages with high impressions and low CTR:
   - Update title and meta description in page metadata or `seo-overrides.ts`.
4. For pages with rank but low engagement:
   - Expand FAQ entries and intro clarity.
5. For cannibalization signals:
   - tighten internal links and reinforce one canonical intent per page.

## Success milestones

- Week 2: all new pages indexed.
- Week 4: at least 3 target pages in top 20 average position.
- Week 8: sustained clicks growth and improved CTR on top-impression pages.

## Change log template

Use this section to track optimization edits and outcomes.

| Date | Page | Change | Reason | Result after 7 days |
|---|---|---|---|---|
| YYYY-MM-DD | `/en/what-week-of-the-year-is-it` | Updated title + first paragraph | Improve CTR for week-intent queries | Pending |
