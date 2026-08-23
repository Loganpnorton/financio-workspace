# Financio

Financio is a responsive financial workspace for reviewing holdings, organizing notes, and arranging a personalized dashboard. It combines a Next.js interface with structured CSV ingestion, live market-price lookups, and schema-validated model output.

## Highlights

- Drag-and-drop dashboard widgets with saved browser preferences
- CSV upload workflow for portfolio holdings
- Genkit and Gemini integration with Zod-validated responses
- Financial Modeling Prep price lookups through server-side actions
- Editable holdings, account summaries, notes, and to-do lists
- Responsive navigation, theme controls, charts, and reusable UI components

## Architecture

| Area | Implementation |
| --- | --- |
| Web application | Next.js 15, React 18, TypeScript |
| Styling | Tailwind CSS, Radix UI, Recharts |
| Data extraction | Genkit, Gemini, Zod schemas |
| Market data | Financial Modeling Prep API |
| Client state | React state and browser local storage |
| Deployment | Firebase App Hosting configuration |

The CSV workflow runs as a server action. Uploaded content is sent to the configured Gemini model for structured extraction, while dashboard preferences and processed results are stored in the browser.

## Run locally

Requirements:

- Node.js 20 or newer
- Gemini API key
- Financial Modeling Prep API key

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set the values in `.env.local` before using CSV processing or live market prices. The interface still renders without API keys, but those integrations remain unavailable.

## Quality checks

```bash
npm run typecheck
npm run build
```

The account balances shown before an upload are demonstration data. Do not upload financial records you are not authorized to process.
