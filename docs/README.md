# Project Documentation

This folder keeps the durable project notes that are still used by the repository workflow. Code remains the source of truth; these files record approved direction, boundaries, and QA expectations so future changes stay consistent.

## Reading Map

| Document | Purpose |
| --- | --- |
| [../AGENTS.md](../AGENTS.md) | Permanent project instructions for Codex work. |
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | Owner identity, audience, scope, and visual mode positioning. |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Visual system, typography, tokens, layouts, components, and anti-patterns. |
| [UI_CONTENT.md](UI_CONTENT.md) | Public copy, tone, CTA wording, and content direction. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Current app structure, providers, routes, data flow, and repository boundaries. |
| [ROUTES.md](ROUTES.md) | Public and admin route inventory. |
| [DATA_MODELS.md](DATA_MODELS.md) | TypeScript models, target backend alignment, media rules, and validation notes. |
| [ANIMATION_3D.md](ANIMATION_3D.md) | GSAP, Lenis, Motion, Three.js, cleanup, reduced motion, and performance rules. |
| [ADMIN_CMS.md](ADMIN_CMS.md) | Admin CMS behavior, CRUD expectations, and backend replacement notes. |
| [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) | Command and manual QA checklist before completion. |
| [DECISIONS.md](DECISIONS.md) | Approved architectural and design decisions. |
| [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) | Supabase runtime boundary, secrets, functions, and verification flow. |
| [../PLANS.md](../PLANS.md) | ExecPlan workflow for long-running implementation tasks. |

## Maintenance Rules

- Keep links relative and valid.
- Do not document unfinished behavior as complete.
- Update backend notes when Supabase runtime behavior changes.
- Update design notes only for approved visual direction, not temporary experiments.
- Prefer deleting stale notes over keeping duplicate instructions.
