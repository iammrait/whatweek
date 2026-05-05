# What Week Is It Canada (weekisit)

A modern, responsive, and bilingual (English/French) week number calendar built specifically for Canada. It provides the current ISO week number, an interactive year calendar, and contextual information about federal and provincial public holidays.

## Features

- **ISO Week Numbers**: Instantly see the current ISO week number (WN/SN).
- **Bilingual Support**: Full English (`en-CA`) and French (`fr-CA`) localization, including proper Canadian French accents and grammar.
- **Provincial Holidays**: Filters public holidays by province/territory. "All Canada" view defaults to national/federal holidays.
- **Long Weekend Detector**: Automatically calculates and displays the next upcoming long weekend based on your province.
- **Responsive UI**: Clean card-based layout with focused mobile and desktop views, built using Next.js App Router and vanilla CSS.
- **Programmatic SEO**: Dynamic, province-aware titles and metadata, plus dynamic OpenGraph image generation.

## Data Sources

- **Public Holidays**: Powered by the [Nager.Date API](https://date.nager.at/) (v3) to fetch real-time holiday data for Canada.
- **ISO Standard**: Week numbers adhere to the ISO-8601 standard, where weeks start on Monday.

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- React 19
- TypeScript
- Vanilla global CSS

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is optimized for deployment on Vercel. 
The holidays data is fetched with `next: { revalidate: 86400 }` (24 hours) to keep the API usage low while ensuring the holiday data stays fresh.
