# Fazri Lukman Nurrohman Portfolio

<p align="center">
  <strong>Creative Web Developer portfolio with a public website, admin CMS, Supabase-backed content, blog, guestbook, and dual visual modes.</strong>
</p>

<p align="center">
  <a href="https://fazrilukman.id">Live Website</a>
  &nbsp;|&nbsp;
  <a href="#quick-start">Quick Start</a>
  &nbsp;|&nbsp;
  <a href="#deployment">Deployment</a>
  &nbsp;|&nbsp;
  <a href="#project-map">Project Map</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=111827">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=ffffff">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6.3-646cff?style=for-the-badge&logo=vite&logoColor=ffffff">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Connected-3ecf8e?style=for-the-badge&logo=supabase&logoColor=0b1220">
</p>

## Overview

This repository powers the personal portfolio of **Fazri Lukman Nurrohman**, positioned as a Creative Web Developer with a primary focus on web development and supporting strengths in UI design, photography, videography, and visual editing.

The app is a React + TypeScript + Vite frontend with a shared public/admin data layer. Production content is connected to Supabase through repository adapters, storage URLs, and Edge Functions, while the UI remains deployable as a static frontend bundle for Vercel or cPanel-style hosting.

## Highlights

| Area | What it does |
| --- | --- |
| Public portfolio | Home, about, projects, creative works, certificates, blog, contact, and detail pages. |
| Admin CMS | Manage profile, hero, projects, stack, creative works, certificates, articles, comments, and messages. |
| Supabase content | Stores portfolio content, media URLs, contact messages, guestbook comments, replies, and likes. |
| Guestbook | Public comments, one-like-per-device behavior, replies, moderation, pinning, and admin reply support. |
| Visual modes | Professional Mode as the default baseline and Spider Mode as an original alternate identity. |
| Blog and SEO | Admin-managed articles with public blog routes and metadata helpers for search visibility. |
| Performance | Reduced heavy scroll work, motion-safe behavior, and responsive layouts for desktop, tablet, and mobile. |

## Tech Stack

| Layer | Tools |
| --- | --- |
| App | React 19, TypeScript 5.9, Vite 6 |
| Routing | React Router |
| Styling | Tailwind CSS, project CSS tokens, Radix UI primitives |
| Motion | Motion, GSAP, Lenis |
| 3D | Three.js with static fallback behavior |
| Backend | Supabase database, storage, auth, Edge Functions |
| Icons/UI | Lucide React, Sonner, Vaul, CMDK |

## Quick Start

```bash
npm install
npm run dev
```

The Vite dev server usually runs at:

```text
http://localhost:5173
```

## Environment

Create `.env.local` or configure these values in the hosting dashboard:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PUBLIC_BUCKET=portfolio-public
VITE_ADMIN_AUTH_DOMAIN=portfolio-admin.example
VITE_ENABLE_SUPABASE=true
VITE_ENABLE_REALTIME=true
```

For admin scripts and Edge Functions, keep service-role secrets outside browser-exposed `VITE_*` variables.

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_AUTH_EMAIL=
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development. |
| `npm run typecheck` | Run TypeScript validation. |
| `npm run lint` | Current lint alias, also runs TypeScript validation. |
| `npm run build` | Type-check and build production output into `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run supabase:verify` | Check Supabase connectivity and required tables/features. |
| `npm run supabase:create-admin` | Create the initial Supabase admin user. |
| `npm run supabase:upload-assets` | Upload seed/static assets to Supabase Storage. |
| `npm run supabase:types` | Generate Supabase TypeScript types. |

## Supabase Note

The SQL setup files and local seed/test SQL assets are intentionally not kept in this repository after being applied to the Supabase project. Runtime code now depends on:

- Supabase environment variables
- generated database types in `src/app/lib/supabase/database.types.ts`
- repository adapters in `src/app/repositories`
- Edge Functions in `supabase/functions`
- verification and admin scripts in `scripts`

If a fresh Supabase project is created later, export the current schema from Supabase or regenerate migrations from the live database before applying it to the new project.

## Project Map

```text
src/
  app/
    components/       Shared UI, portfolio, admin, layout, and utility components
    context/          Theme mode and admin auth providers
    data/seed/        Typed fallback content
    hooks/            Public/admin data and metadata hooks
    lib/              Supabase client, helpers, and generated types
    pages/            Public and admin route pages
    repositories/     Shared data access layer
    types/            Portfolio TypeScript models
  imports/            Character and visual assets
  styles/             Global CSS, theme tokens, and responsive styles

supabase/
  functions/          Public Edge Functions for contact, comments, and likes

scripts/
  *.mjs               Admin setup, Supabase verification, imports, and asset upload
```

## Deployment

Build locally before deploying:

```bash
npm run typecheck
npm run lint
npm run build
```

For Vercel, add the `VITE_*` environment variables to Production and Preview. For cPanel or static hosting, upload the generated `dist/` output and keep the same frontend environment values available during build time.

Supabase Edge Functions are deployed separately:

```bash
supabase functions deploy submit-contact
supabase functions deploy submit-comment
supabase functions deploy like-comment
```

## Documentation

The working documentation remains in `docs/` because it is referenced by the repository instructions and future maintenance workflow. Start with:

- [AGENTS.md](AGENTS.md)
- [docs/README.md](docs/README.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md)

## License

No public license has been specified. All project content belongs to Fazri Lukman Nurrohman unless stated otherwise.
