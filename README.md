# Portfolio Fazri

Personal portfolio and frontend CMS prototype for Fazri Lukman Nurrohman, a Creative Web Developer focused on web applications, interface design, and visual storytelling.

The application is a React + TypeScript + Vite frontend. Public portfolio pages and the admin CMS prototype share one typed data source through a repository layer. Current persistence is frontend-only through `localStorage`.

## Project Status

| Area | Status | Notes |
| --- | --- | --- |
| Public portfolio | In progress | Main public routes exist and render portfolio content. |
| Professional Mode | Prototype | Default visual baseline with dark graphite/navy surfaces and cyan/teal accents. |
| Spider Mode | Prototype | Alternate original visual mode with crimson styling and web geometry. |
| Character reveal | Prototype | Professional and Spider character assets are layered in the hero. |
| Project pages | Complete frontend route | Dedicated `/projects/:slug` detail route exists for current demo data. |
| Creative Works | Complete frontend route | Listing and `/creative-works/:slug` detail route exist. |
| Certificates | Prototype | Certificate gallery exists; no dedicated certificate detail route. |
| Contact and Guestbook | Prototype | Contact messages and comments are stored locally. |
| Admin login | Demo only | Simulated auth using local/session storage. |
| Admin dashboard | Prototype | Frontend dashboard exists. |
| Admin CRUD | Prototype | CRUD screens use local repository persistence. |
| Local persistence | Implemented | Versioned `localStorage` key with seed fallback and normalization. |
| Backend integration | Not connected | No production auth, database, media storage, or email delivery yet. |
| Deployment readiness | Buildable | Vite build works; production backend features remain planned. |

## Main Features

- Dual visual modes: Professional Mode and Spider Mode.
- Public portfolio with home, about, projects, creative works, certificates, and contact routes.
- Dedicated project case-study pages.
- Creative work archive with detail pages.
- Contact form and guestbook/comment flow backed by local demo persistence.
- Animated UI using GSAP, Motion, and Lenis.
- Three.js hero scene for interactive portfolio atmosphere.
- Frontend admin CMS prototype for profile, hero, projects, tech stack, creative works, experience, certificates, comments, messages, media, and settings.
- Import, export, and reset behavior through the local repository layer.

## Technology Stack

| Area | Current packages |
| --- | --- |
| Core | React 19.2.1, React DOM 19.2.1, TypeScript 5.9.3, Vite 6.3.5 |
| Styling | Tailwind CSS 4.1.12, `@tailwindcss/vite`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` |
| Animation | GSAP, Motion, Lenis |
| 3D | Three.js, `@types/three` |
| Routing | React Router 7.13.0 |
| Forms and UI | Radix UI primitives, React Hook Form, Lucide React, Sonner, Vaul, CMDK |
| Data visualization | Recharts |
| Local persistence | Browser `localStorage` and `sessionStorage` through repository abstractions |
| Tooling | Vite, TypeScript, `@vitejs/plugin-react` |

## Installation

```bash
npm install
npm run dev
```

The dev server defaults to Vite's local URL, usually `http://localhost:5173`.

## Available Scripts

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `vite` | Start the development server. |
| `build` | `tsc --noEmit && vite build` | Type-check and build the production bundle. |
| `preview` | `vite preview` | Preview the production build locally. |
| `typecheck` | `tsc --noEmit` | Run TypeScript validation. |
| `lint` | `tsc --noEmit` | Current lint placeholder; it performs the TypeScript check. |

## Project Structure

```text
src/
  app/
    components/      Shared UI, layout, admin, portfolio, and shadcn-style components
    context/         Theme mode and admin auth providers
    data/seed/       Typed seed content for the frontend demo
    hooks/           Portfolio data and document metadata hooks
    lib/             Storage helpers
    pages/admin/     Admin CMS prototype pages
    pages/public/    Public portfolio pages
    repositories/    Local auth and portfolio data repositories
    types/           Portfolio TypeScript models
  imports/           Character image assets
  styles/            Global and theme CSS
```

## Public Routes

The public route reference is maintained in [docs/ROUTES.md](docs/ROUTES.md).

## Admin Routes

The admin CMS reference is maintained in [docs/ADMIN_CMS.md](docs/ADMIN_CMS.md).

## Demo Data and Local Storage

Seed data is loaded from `src/app/data/seed/portfolioSeed.ts`. Runtime data is read and written through `src/app/repositories/portfolioRepository.ts` using the key `fazri-portfolio-demo-v3`.

The repository normalizes stored data against the current seed shape, exports JSON, imports JSON, and resets demo data. This is frontend-only persistence; clearing browser storage removes local changes.

Admin authentication is simulated through `src/app/repositories/authRepository.ts` with the key `fazri-admin-session`.

## Character Assets

The hero uses separate Professional and Spider character images. These assets must remain visually aligned so the reveal effect can switch between modes without shifting the head, shoulders, torso, or arms. Do not replace them with unrelated textures or franchise assets.

## Animation and 3D

Animation and 3D expectations are documented in [docs/ANIMATION_3D.md](docs/ANIMATION_3D.md).

## Accessibility

The target is keyboard-accessible navigation, visible focus states, labeled forms, dialog focus management, reduced-motion support, and touch alternatives for hover-driven interactions. Use [docs/TESTING_CHECKLIST.md](docs/TESTING_CHECKLIST.md) before marking UI work complete.

## Deployment

The build output is generated by Vite in `dist/`. It can be hosted on static frontend platforms once the desired deployment target is chosen. Backend-dependent features such as real authentication, permanent media upload, database storage, and email delivery are not connected yet.

## Documentation

Start with [docs/README.md](docs/README.md) and [AGENTS.md](AGENTS.md) before changing implementation details.

## License or Usage

No public license has been specified in this repository.
