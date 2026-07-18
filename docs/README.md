# Documentation Index

Repository code is the source of truth for current behavior. Documentation records both current implementation and approved target behavior, and it must clearly distinguish between the two. Long-running implementation work should use an ExecPlan from [../PLANS.md](../PLANS.md). New durable decisions should be recorded in [DECISIONS.md](DECISIONS.md).

| Document | Purpose | Read when |
| --- | --- | --- |
| [../AGENTS.md](../AGENTS.md) | Permanent Codex operating instructions for this project. | Before making project changes. |
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | Owner, brand, audience, scope, modes, and non-goals. | Changing positioning, copy direction, or product scope. |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Visual system, tokens, typography, layout, components, and anti-patterns. | Changing UI, CSS, layout, mode styling, or visual direction. |
| [UI_CONTENT.md](UI_CONTENT.md) | Public copy, tone, hero text, services, projects, contact, and wording limits. | Editing portfolio content or admin-editable public copy. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Current app structure, providers, data flow, and boundaries. | Moving code, adding features, or changing data access. |
| [ROUTES.md](ROUTES.md) | Public and admin route inventory. | Adding, removing, or changing pages/routes. |
| [DATA_MODELS.md](DATA_MODELS.md) | Current TypeScript models, target model shape, storage, and validation. | Editing seed data, repository logic, forms, or future backend schema. |
| [ANIMATION_3D.md](ANIMATION_3D.md) | Animation, Lenis, Motion, GSAP, Three.js, character reveal, and cleanup rules. | Editing motion, hero, WebGL, or character reveal. |
| [ADMIN_CMS.md](ADMIN_CMS.md) | Admin prototype behavior, CRUD requirements, and backend replacement boundaries. | Editing admin pages or CMS behavior. |
| [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) | Manual and command-based verification checklist. | Before marking a task complete. |
| [DECISIONS.md](DECISIONS.md) | Architecture and design decision records. | Checking whether a choice is already approved or adding a new decision. |
| [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) | Future backend migration guide. | Replacing local persistence, auth, media, contact, or comments. |
| [../PLANS.md](../PLANS.md) | ExecPlan rules and template. | Work spans multiple areas or sessions. |
| [../CHANGELOG.md](../CHANGELOG.md) | Changelog for documentation and future project changes. | Recording notable changes. |

## Documentation Principles

- Use the real repository as the source of truth for current behavior.
- Mark approved targets separately from implemented behavior.
- Do not claim unfinished features are complete.
- Keep links relative and valid.
- Record durable decisions in [DECISIONS.md](DECISIONS.md).
- Use an ExecPlan for long-running implementation work.
