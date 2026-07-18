# Architecture

## Current Stack

The project is a React 19 + TypeScript + Vite frontend application. It uses React Router for routing, Tailwind CSS for styling, Radix UI primitives for many UI building blocks, GSAP/Motion/Lenis for animation, and Three.js for the hero scene.

## Current Folder Structure

```text
src/
  app/
    App.tsx
    components/
      admin/
      common/
      figma/
      layout/
      portfolio/
      ui/
    context/
    data/seed/
    hooks/
    lib/
    pages/
      admin/
      public/
    repositories/
    types/
  imports/
  styles/
```

The actual codebase uses `src/app`, not the target-style `src/components` and `src/pages` root folders. Documentation and nested AGENTS files should follow the actual structure.

## Application Entry

`src/app/App.tsx` defines:

- `ThemeModeProvider`
- `AdminAuthProvider`
- `BrowserRouter`
- public layout with `SmoothScrollProvider`, `LoadingScreen`, `Navbar`, route transition wrapper, and `Footer`
- protected admin layout using `AdminRoute` and `AdminLayout`
- all current public and admin routes

## Providers and Context

| Provider | File | Responsibility |
| --- | --- | --- |
| `ThemeModeProvider` | `src/app/context/ThemeModeContext.tsx` | Professional/Spider mode state and mode class behavior. |
| `AdminAuthProvider` | `src/app/context/AdminAuthContext.tsx` | Demo admin session state backed by `authRepository`. |
| `SmoothScrollProvider` | `src/app/components/common/SmoothScrollProvider.tsx` | Public smooth scrolling behavior. |

## Data Flow

Current data flow:

```text
seed data -> portfolioRepository -> hooks/pages/components -> public and admin UI
```

Pages should consume data through hooks or repository methods. Page components should not directly access `localStorage` when a repository layer exists.

## Repository Layer

| Repository | File | Current storage |
| --- | --- | --- |
| Portfolio data | `src/app/repositories/portfolioRepository.ts` | `localStorage`, key `fazri-portfolio-demo-v3` |
| Admin auth | `src/app/repositories/authRepository.ts` | `localStorage` or `sessionStorage`, key `fazri-admin-session` |

`portfolioRepository` normalizes stored data against seed data, emits `portfolio-data-change`, supports CRUD for current entities, and exposes import/export/reset helpers.

## Public Pages

Current public pages live in `src/app/pages/public`. Most routes are implemented as dedicated page components. `HomePage.tsx` remains a large page component and should be split into smaller section components in future refactors.

## Admin Pages

Current admin pages live in `src/app/pages/admin`. They are frontend prototype screens and should favor clarity, dense information, validation, and predictable CRUD behavior over cinematic effects.

## Styling

Global styles live in `src/styles`. Theme tokens are currently defined in `src/styles/theme.css` using project-level CSS variables and `.spider-mode` overrides.

Avoid broad global overrides. Spider Mode selectors should be scoped and intentional.

## Animation and 3D Boundaries

Three.js and portfolio visual components live in `src/app/components/portfolio`. Animation and WebGL code must clean up resources and respect reduced motion. See [ANIMATION_3D.md](ANIMATION_3D.md).

## Known Current Limitations

- No backend is connected.
- Admin authentication is simulated.
- Media upload is local and temporary.
- Homepage is still more monolithic than the approved target architecture.
- Some admin CRUD behavior is prototype-level.
- `npm run lint` currently aliases TypeScript checking rather than a dedicated linter.
- Production build may need future code splitting if bundle warnings matter for deployment.

## Target Architecture Direction

- Keep public and admin consuming one shared data source.
- Keep repository interfaces stable so a backend adapter can replace local storage later.
- Split large pages into sections and reusable components.
- Keep business data out of visual-only components.
- Add validation close to forms and repository boundaries.
- Record durable architectural choices in [DECISIONS.md](DECISIONS.md).
