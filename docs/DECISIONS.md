# Decisions

Use this file for durable architecture and design decisions. Future entries should include ID, title, status, date, context, decision, and consequences.

## ADR-001 - Professional Mode Is the Default

Status: Accepted

Date: Initial documentation

Context: The portfolio must serve recruiters, companies, clients, and academic reviewers first.

Decision: Professional Mode loads by default, and the user selection may persist locally.

Consequences: Professional Mode remains the baseline for readability, credibility, and layout decisions.

## ADR-002 - Spider Mode Is an Original Alternate Identity

Status: Accepted

Date: Initial documentation

Context: The project needs a distinctive alternate visual identity without copyright risk.

Decision: Spider Mode must not copy copyrighted franchise assets and must change more than color.

Consequences: Use original web geometry, crimson motion language, and transformed interface architecture.

## ADR-003 - Project Details Use Dedicated Routes

Status: Accepted

Date: Initial documentation

Context: Project case studies need deep content, shareable URLs, and clean navigation.

Decision: Full project details use `/projects/:slug`, not a modal.

Consequences: Project pages can support richer metadata, layout, and direct links.

## ADR-004 - Creative Work Details Use Dedicated Routes

Status: Accepted

Date: Initial documentation

Context: Creative works need their own gallery and narrative space.

Decision: Creative work details use `/creative-works/:slug`.

Consequences: Creative items remain navigable without overloading listing pages.

## ADR-005 - Public and Admin Share One Repository

Status: Accepted

Date: Initial documentation

Context: Public pages and admin pages must reflect the same content.

Decision: Public and admin consume the same data source.

Consequences: Data edits in admin can update public UI without duplicate seed sources.

## ADR-006 - Local Storage Is Temporary Frontend Persistence

Status: Accepted

Date: Initial documentation

Context: The current project has no backend.

Decision: Frontend CRUD uses local persistence until a backend is integrated.

Consequences: Data is browser-local and must not be described as server-persistent.

## ADR-007 - No Decorative Rotating F or FL 3D Object

Status: Accepted

Date: Initial documentation

Context: Initials as a large 3D object can feel generic and distract from the portfolio narrative.

Decision: Brand initials remain in normal branding areas only.

Consequences: 3D work should focus on interface architecture and storytelling.

## ADR-008 - 3D Must Support the Portfolio Narrative

Status: Accepted

Date: Initial documentation

Context: 3D should explain the developer identity rather than act as decoration.

Decision: Professional uses Digital Interface Architecture; Spider uses Digital Web Architecture.

Consequences: 3D scenes should include panels, nodes, data paths, and mode-specific material language.

## ADR-009 - Admin Motion Is Subtle

Status: Accepted

Date: Initial documentation

Context: Admin screens are tools for repeated editing.

Decision: Cinematic motion is reserved for public pages.

Consequences: Admin UI should favor speed, clarity, and predictable feedback.

## ADR-010 - Character Assets Are Layered, Not Regenerated at Runtime

Status: Accepted

Date: Initial documentation

Context: The hero reveal depends on visual alignment.

Decision: Use the supplied Professional and Spider assets with calibrated alignment.

Consequences: Do not generate unrelated replacement images at runtime.

## ADR-011 - Mobile Must Not Depend on Hover

Status: Accepted

Date: Initial documentation

Decision: Any hover-driven reveal or interaction must have a mobile tap/toggle alternative.

Consequences: Test touch behavior separately from desktop pointer behavior.

## ADR-012 - No Broad Spider CSS Overrides

Status: Accepted

Date: Initial documentation

Decision: Avoid broad selectors such as `.spider-mode *`.

Consequences: Mode styling must be scoped to intended components and surfaces.

## ADR-013 - Frontend Media Upload Is Not Permanent

Status: Accepted

Date: Initial documentation

Decision: Frontend media records may store temporary object URLs, but actual files are not permanently stored.

Consequences: Admin UI and documentation must describe upload limitations honestly.

## ADR-014 - Dependency Compatibility Must Be Solved Properly

Status: Accepted

Date: Initial documentation

Decision: Dependency conflicts must be fixed through compatible versions or deliberate migration, not permanent `--force` or `--legacy-peer-deps`.

Consequences: Package changes require compatibility checks and validation.

## ADR-015 - Public Cinematic Motion Uses One Shared Renderer

Status: Accepted

Date: 2026-07-17

Context: The public portfolio needed richer cinematic motion without redesigning approved UI or adding multiple WebGL contexts.

Decision: Keep the full splash as a boot-only public overlay and mount one shared public Three.js ambient renderer inside the public layout. Route and section changes are passed to the scene through lightweight route context and browser events.

Consequences: Admin remains unchanged, route content remains unchanged, and WebGL cleanup/reduced-motion fallback is required for every renderer.

## Future ADR Template

```markdown
## ADR-000 - Title

Status: Proposed | Accepted | Superseded

Date: YYYY-MM-DD or Initial documentation

Context: Explain the situation.

Decision: State the decision.

Consequences: Explain tradeoffs and follow-up requirements.
```
