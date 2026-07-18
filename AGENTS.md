# Project Identity

Owner: Fazri Lukman Nurrohman.

Primary identity: Creative Web Developer.

Main focus: Web Development.

Supporting capabilities:
- UI and Visual Design
- Graphic Design
- Photography
- Videography
- Photo Editing
- Video Editing

Web Development must remain visually and structurally dominant. The target portfolio balance is approximately 70% web-development work and 30% supporting creative work.

# Required Workflow

Codex must:

1. Inspect relevant existing files.
2. Read the corresponding documentation.
3. Preserve approved decisions.
4. Implement requested changes directly.
5. Validate the result.
6. Fix errors before reporting completion.

Do not stop after writing only a plan unless the user explicitly asks for planning only.

# Documentation Map

Read these documents before changing the related area:

| Document | Read when |
| --- | --- |
| [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) | Positioning, audience, content balance, product scope, and non-goals. |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Visual design, typography, tokens, layout, components, and anti-patterns. |
| [docs/UI_CONTENT.md](docs/UI_CONTENT.md) | Public copy, project wording, services, CTAs, and tone. |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Folder structure, providers, data flow, and implementation boundaries. |
| [docs/ROUTES.md](docs/ROUTES.md) | Public routes, admin routes, redirects, route metadata, and route behavior. |
| [docs/DATA_MODELS.md](docs/DATA_MODELS.md) | Current TypeScript models, target models, storage schema, and validation expectations. |
| [docs/ANIMATION_3D.md](docs/ANIMATION_3D.md) | GSAP, Lenis, Motion, Three.js, character reveal, cleanup, and performance rules. |
| [docs/ADMIN_CMS.md](docs/ADMIN_CMS.md) | Admin UX, CRUD behavior, demo authentication, and future backend replacement. |
| [docs/TESTING_CHECKLIST.md](docs/TESTING_CHECKLIST.md) | Verification checklist for routes, admin, modes, animation, 3D, responsive, and accessibility. |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Approved architectural and design decisions. |
| [docs/BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md) | Future backend migration boundaries and security notes. |
| [PLANS.md](PLANS.md) | ExecPlan workflow for long-running work. |

# Approved Visual Baseline

- Professional Mode is the default approved baseline.
- Do not redesign Professional Mode from zero unless explicitly requested.
- Spider Mode is an original alternate visual identity.
- Spider Mode must not be implemented as only a red recolor.
- Do not use official Marvel, Spider-Man, or other franchise assets.
- Do not use a rotating F or FL monogram as a large 3D decoration.
- Do not replace character images with unrelated textures.

# Coding Rules

- Use strict TypeScript and avoid unnecessary `any`.
- Prefer modular components; avoid oversized monolithic page components.
- Do not duplicate public and admin content sources.
- Do not access `localStorage` directly from page components when a repository layer exists.
- Do not ship visible placeholder labels.
- Do not use broad `.spider-mode *` selectors.
- Do not use `transition: all`.
- Remove obsolete unused runtime components.
- Clean up listeners, RAF loops, GSAP timelines, ScrollTrigger instances, Lenis instances, WebGL geometries, materials, textures, and renderers.
- Check dependency compatibility before installation.
- Do not use `--force` or `--legacy-peer-deps` as a permanent dependency solution.

# UI Rules

- Do not place every element in a rounded card.
- Avoid generic AI-template layouts.
- Use content hierarchy and intentional asymmetry.
- Avoid excessive glow, pills, borders, particles, and glassmorphism.
- Use recognizable technology logos where available.
- Project mockups must contain meaningful UI details.
- Dashboard overlays must not cover the character's face.
- Typography must remain readable.
- Mobile must not rely on hover.

# Data Rules

Until a backend is connected:

- Use typed seed data.
- Use a repository abstraction.
- Use versioned `localStorage` persistence.
- Handle invalid stored data safely.
- Public and admin must consume the same data source.
- Local media object URLs are session-limited.
- The UI must not claim permanent server upload.

# Validation

Available repository commands from `package.json`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite development server. |
| `npm run build` | Run TypeScript check and create production build. |
| `npm run preview` | Preview built output. |
| `npm run typecheck` | Run `tsc --noEmit`. |
| `npm run lint` | Currently aliases `tsc --noEmit`. |

At minimum, when relevant and available, run:

```bash
npm run typecheck
npm run lint
npm run build
```

# Completion Report

Final implementation reports must include:

- files changed
- behavior implemented
- validation commands run
- results
- remaining limitations
