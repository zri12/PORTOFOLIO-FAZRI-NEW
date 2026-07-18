# Animation and 3D

## Purpose

Animation must clarify hierarchy, transitions, and storytelling. It must not exist only as decoration.

## Libraries

Installed animation and 3D libraries:

| Library | Current or intended responsibility |
| --- | --- |
| GSAP | Timeline and scroll storytelling where imported. |
| ScrollTrigger | Scroll-linked sequences when registered and cleaned up. |
| Lenis | Public smooth scrolling. |
| Motion | Component microinteractions and route/page transitions. |
| Three.js | Hero 3D scene. |

Do not document a library as active in a component unless the component imports or uses it.

## Global Rules

- Do not animate every paragraph.
- Do not use `transition: all`.
- Do not create multiple Lenis instances.
- Avoid heavy animation in admin pages.
- Support `prefers-reduced-motion`.
- Clean up every animation resource.
- Avoid layout-thrashing properties.
- Prefer `transform` and `opacity`.
- Mobile motion must be simpler than desktop motion.

## Hero Sequence

Approved four-stage hero animation:

| Stage | Purpose | Expected movement |
| --- | --- | --- |
| Introduction | Establish atmosphere and readable identity. | Text enters calmly; character is stable. |
| Identity | Make Fazri's role and focus clear. | Headline and CTA hierarchy settle. |
| Interaction | Show mode and character reveal affordance. | Character reveal, mode card, dashboard, and 3D respond to pointer or tap. |
| Transition to About | Lead the user into the rest of the portfolio. | Scroll cues and section transition support continuity. |

## Character Reveal

The reveal uses two aligned image layers:

- Professional image is the default layer.
- Spider image is revealed on hover/pointer interaction and in full Spider Mode.
- Mobile must support tap or toggle behavior because hover is unavailable.
- Pointer coordinates should be calculated relative to the portrait container.
- Use a separate outer animation wrapper and inner mask wrapper.

Approved desktop reveal:

- radius: approximately 68-82px
- feather: approximately 10-14px
- no large red portal
- thin restrained boundary

## Character Calibration

Calibrate per breakpoint:

- `object-fit: contain`
- `object-position: center top`
- `transform-origin: 50% 0%`
- Align head, eyes, shoulders, torso, and arms between both assets.

Dashboard overlays must not cover the character's face.

## Professional 3D Scene

Name: Digital Interface Architecture.

Visual direction:

- browser-like panels
- graphite core
- glass surfaces
- cyan and teal nodes
- data paths
- visible lighting and depth

## Spider 3D Scene

Name: Digital Web Architecture.

Visual direction:

- same architecture transformed
- black metallic core
- crimson paths
- red nodes
- smoked glass
- limited blue data accents

## Forbidden 3D Concepts

- rotating F
- giant FL monogram
- atom/orbit model
- random cube
- generic sphere and rings
- official spider emblem
- meaningless spinning object

## Homepage Section Motion

| Section | Target motion |
| --- | --- |
| Hero | Primary narrative sequence with character, text, dashboard, mode card, and 3D scene. |
| About | Subtle reveal and text rhythm. |
| Featured Projects | Project cards may use staggered entrance and hover depth. |
| Development Process | Steps may reveal progressively. |
| Tech Stack | Light grouping animation only. |
| Creative Works | Gallery movement should support browsing, not distract. |
| Experience | Timeline movement should remain readable. |
| Certificates | Minimal reveal. |
| Contact | Calm entrance and form feedback. |
| Route transitions | Short and consistent; do not delay navigation. |

## Responsive Motion

- Desktop: richer hero and 3D interaction allowed.
- Tablet: reduce parallax and scene complexity.
- Mobile: remove hover dependency, reduce movement distance, and prioritize stable layout.

## Reduced Motion

When reduced motion is requested:

- disable long scroll-linked sequences
- disable continuous decorative motion
- preserve instant or near-instant state changes
- provide static hero and 3D fallback where needed

## Performance

- Prefer one primary WebGL canvas where practical.
- Desktop DPR maximum should be approximately 1.5.
- Mobile DPR maximum should be approximately 1.
- Pause offscreen animation.
- Dispose geometries, materials, textures, and renderers.
- Limit node count.
- Avoid huge particle systems.
- Avoid multiple autoplay videos.
- Provide a static fallback when WebGL fails.

## Cleanup Checklist

- [ ] RAF loop cancelled.
- [ ] Event listeners removed.
- [ ] Lenis instance destroyed.
- [ ] GSAP timelines killed.
- [ ] ScrollTrigger instances killed.
- [ ] WebGL renderer disposed.
- [ ] Geometries disposed.
- [ ] Materials disposed.
- [ ] Textures disposed.
- [ ] ResizeObserver disconnected.
- [ ] IntersectionObserver disconnected.

## Current 2026 Public Animation Additions

- `LoadingScreen` now runs a boot-only cinematic Digital Portfolio Core splash for public routes without `sessionStorage` suppression.
- The splash uses direct Three.js when available and a layered interface fallback when WebGL or reduced-motion prevents rendering.
- `PortfolioAmbient3D` mounts one shared public Three.js canvas and adapts to route, section intersection, and Professional/Spider mode.
- Route transitions use the existing route structure with a short mode-aware signal line and reduced-motion crossfade behavior.
- Native scrolling remains in place; section detection uses IntersectionObserver and does not update React state on every scroll frame.
