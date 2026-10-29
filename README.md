# careerlens-ai

CareerLens AI is a learning-project MVP for exploring resume feedback and career next steps. It is an educational tool, not a hiring system, a guarantee of employment, or professional career advice.

## What is implemented

- A responsive landing page, fictional example report, career catalog, and learning catalog.
- Resume review from pasted text or PDF/DOCX documents, with general-review, job-match, and career-exploration modes.
- A transparent, deterministic weighted rubric. If an OpenAI key is configured, structured AI feedback supplements that score; without one, the app clearly labels its simpler local text-cue preview.
- Sign-up, sign-in, a protected dashboard, and saved reports through optional Supabase Auth and PostgreSQL. Report saving is opt-in; raw resume text and uploaded files are not saved by this app.
- Owner-scoped row-level security in the Supabase migration.

All demo people and example reports are fictional. The included career and learning lists are small starter catalogs, not labor-market recommendations. AI output can be wrong: verify all claims and use only facts you can support.

## Technologies

- Next.js App Router, React, and TypeScript.
- Tailwind CSS v4 with project-specific responsive CSS and design tokens.
- A reusable shadcn-style button primitive, Radix Slot, and Lucide icons.
- Recharts for score visuals and Zod for request/report validation.
- Optional OpenAI Responses API and Supabase Auth/PostgreSQL integrations.
- Vitest unit tests and Playwright browser tests.

## Run locally

Requirements: Node.js 20.9 or newer and npm.

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The core local preview works without API keys or a database.

Useful checks:

```powershell
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

Playwright may require a browser the first time:

```powershell
npx playwright install chromium
```

## Optional services

Copy `.env.example` to `.env.local` and add only credentials for services you intentionally configure. Never commit `.env.local`.

### OpenAI analysis

Set `OPENAI_API_KEY` to a key from your OpenAI account. `OPENAI_MODEL` is optional and defaults to `gpt-4.1-mini`. When a key is configured, the submitted resume text is sent to OpenAI after simple email and phone-pattern redaction. That redaction is not comprehensive anonymization. Review the provider's data policies before sending personal information. If the key is absent, the app uses the explicitly labeled local heuristic; it does not pretend that the heuristic is AI.

### Supabase accounts and saved reports

1. Create a Supabase project and configure its Auth email settings.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`. These are the project's URL and public anon/publishable key; never put a service-role key in this frontend project.
3. Apply [`supabase/migrations/202610280001_initial_private_analyses.sql`](./supabase/migrations/202610280001_initial_private_analyses.sql) in the Supabase SQL editor or through the Supabase CLI.
4. Restart the development server and try sign-up. Email confirmation behavior depends on your Supabase Auth settings.

The migration creates profiles and saved-report records protected by row-level security. The app supplies the authenticated user ID on the server, and the database policies restrict report access to that owner. Without Supabase configuration, public pages and local analysis remain usable, while account and saved-report operations show an unavailable state.

## Main project files

- `package.json` — app scripts and runtime/development dependencies.
- `src/app/` — Next.js App Router pages, API routes, and shared layout/styles.
- `src/components/` — reusable site, form, authentication, and report UI.
- `src/components/ui/button.tsx` — the reusable button primitive; `components.json` contains the shadcn component-generation settings.
- `src/lib/analysis/` — input/output validation, scoring, catalog data, document parsing, and analysis service.
- `src/lib/supabase/` — server-side Supabase client.
- `src/proxy.ts` — refreshes Supabase Auth cookies for requests.
- `supabase/migrations/` — SQL schema and owner-only row-level-security policies.
- `tests/e2e/` — Playwright browser checks; `*.test.ts` files alongside analysis code are Vitest unit tests.
- `.env.example` — safe environment-variable names with blank example values.

## Current limitations and privacy

- This is a prototype and has not been independently validated for hiring, employment, legal, or accessibility decisions.
- Local scoring is based on simple word cues, not semantic understanding. It cannot establish skill proficiency or job suitability.
- AI output is generated, not verified; recommendations/resources are restricted to the small curated catalog where possible.
- The analysis API uses a small in-memory request throttle, which is not shared across instances and is not sufficient production abuse protection.
- PDF/DOCX parsing is best-effort; review extracted text before analyzing it.
- Supabase and OpenAI integrations require credentials and were not live-tested as part of this local MVP.
- Never submit real confidential resumes or other sensitive personal information to an unconfigured or unreviewed deployment. Saved reports may contain information derived from the resume and should be deleted when no longer needed.

This project is not connected to the existing Hospital Management System workspace.
