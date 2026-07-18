# Design System

## Design Principles

- Premium but readable.
- Modern and human-designed.
- Web Development remains dominant.
- Use intentional asymmetry and varied section composition.
- Use controlled motion and meaningful visual depth.
- Avoid generic AI-template repetition.
- Keep visual effects subordinate to content and usability.

## Typography

| Use | Font | Guidance |
| --- | --- | --- |
| Headings | Manrope | Use confident weights, usually 600-800. |
| Body, controls, navigation, forms | Inter | Use regular to semibold weights, usually 400-600. |
| Metadata | IBM Plex Mono | Use sparingly for labels, counters, and technical metadata. |

Recommended ranges:

- Hero heading: large, responsive, and readable; do not turn long sentences into oversized hero headings.
- Section heading: strong but smaller than hero scale.
- Card heading: compact and scannable.
- Body text: approximately 15-18px with comfortable line height.
- Metadata: approximately 11-13px, often uppercase with restrained tracking.
- Paragraph width: keep long text narrow enough to scan, generally 56-72 characters.

Do not scale typography purely with viewport width. Prefer breakpoint-specific sizes and stable line heights.

## Professional Mode Tokens

Approved token values:

| Token | Value |
| --- | --- |
| `--professional-bg-primary` | `#080C12` |
| `--professional-bg-secondary` | `#0C131C` |
| `--professional-surface-primary` | `#121C27` |
| `--professional-surface-elevated` | `#192634` |
| `--professional-text-primary` | `#F5F7FA` |
| `--professional-text-secondary` | `#A7B2BD` |
| `--professional-text-muted` | `#72808E` |
| `--professional-accent-primary` | `#4EBBE8` |
| `--professional-accent-secondary` | `#73D5C2` |
| `--professional-silver` | `#CAD4DD` |

Current CSS uses project-level names such as `--color-bg-primary`, `--color-bg-secondary`, `--color-surface-elevated`, `--color-surface-lighter`, `--color-text-main`, `--color-text-secondary`, `--color-text-muted`, `--color-accent-main`, `--color-accent-secondary`, and `--color-accent-silver`. Some current values differ slightly from the approved token names and should be reconciled in a future design-system pass, not during documentation-only work.

## Spider Mode Tokens

Approved token values:

| Token | Value |
| --- | --- |
| `--spider-bg-primary` | `#060608` |
| `--spider-bg-secondary` | `#0B080B` |
| `--spider-surface-primary` | `#120D11` |
| `--spider-surface-elevated` | `#1A1016` |
| `--spider-surface-highlighted` | `#25141B` |
| `--spider-accent-primary` | `#E5223D` |
| `--spider-accent-deep` | `#8D1024` |
| `--spider-accent-bright` | `#FF4055` |
| `--spider-accent-blue` | `#4CC8F2` |
| `--spider-text-primary` | `#F7F4F5` |
| `--spider-text-secondary` | `#B8ADB1` |
| `--spider-text-muted` | `#81767B` |

Current CSS defines Spider values on `.spider-mode` with project-level variable names and close but not identical values.

## Spacing

Use an 8px-based spacing system:

| Size | Use |
| --- | --- |
| 4px | micro gaps and fine alignment |
| 8px | compact component spacing |
| 12px | labels, tight groups |
| 16px | default component gap |
| 24px | small sections and card internals |
| 32px | major component groups |
| 48px | section internals |
| 64px | default section spacing |
| 80px | large editorial spacing |
| 96px+ | hero and major page transitions |

Layout rhythm matters more than placing equal spacing everywhere.

## Radius

- Small: 8px.
- Medium: 14px.
- Large: 22px.
- Extra large: only for major visual containers.
- Pill: tags, filters, and compact controls only.

Spider Mode may use selected cropped edges, but not sharp corners everywhere.

## Shadows and Borders

Use shadows and borders to clarify depth and grouping. Avoid putting a border around every component, excessive glow, excessive glass, and noisy layered effects.

## Layout

- Keep public content within a comfortable max-width, usually around 1180-1280px.
- Use desktop grids for comparison and scanning.
- Hero composition should establish identity, primary CTA, character asset, and interactive visual signal in the first viewport.
- Use varied section rhythm instead of identical stacked card grids.
- Stack responsively on tablets and phones.
- Do not place page sections inside floating cards.

## Breakpoints

| Breakpoint | Width |
| --- | --- |
| Large desktop | 1440px |
| Desktop/laptop | 1280px |
| Tablet landscape | 1024px |
| Tablet | 768px |
| Mobile | 390px |
| Small mobile | 360px |

## Components

- Navigation: clear hierarchy, visible active states, mobile menu, mode access.
- Buttons: primary, secondary, ghost, and destructive states; avoid overusing pill shapes.
- Cards: use for individual repeated items, not every page block.
- Project cards: include meaningful visual details, role, category, technologies, and route action.
- Technology cards: should use recognizable logos or iconography where available.
- Filters: compact, keyboard-accessible, and not excessive.
- Form fields: labeled, validated, readable, and responsive.
- Admin tables: dense but calm, with mobile card fallback.
- Status badges: clear labels and non-color-only meaning.
- Dialogs: focus trap, Escape close, destructive confirmation.
- Toasts: concise and not used for critical-only feedback.
- Empty states: explain what is missing and what action is available.
- Skeletons: stable dimensions to avoid layout jumps.

## Mode Differences

| Area | Professional Mode | Spider Mode |
| --- | --- | --- |
| Surfaces | Graphite/navy, calm contrast | Black/crimson, sharper contrast |
| Buttons | Clean filled or outlined controls | Sharper silhouettes, selective red accents |
| Cards | Restrained depth | Cropped edges or stronger directional shadows where useful |
| Backgrounds | Subtle gradients and interface atmosphere | Web geometry and crimson directional energy |
| Section separators | Soft spacing and tonal shifts | Lines, web traces, and stronger transitions |
| Motion | Calm, polished, recruiter-friendly | Faster, directional, cinematic but controlled |
| Lighting | Cyan, teal, silver | Crimson, red, limited blue data accents |
| 3D materials | Graphite, glass, cyan/teal nodes | Black metal, smoked glass, crimson paths |
| Cursor/reveal treatment | Smooth and subtle | Sharper boundary with restrained reveal radius |

## Anti-Patterns

- repeated identical card grids
- giant decorative letters
- random orbit lines
- generic atom models
- large circular reveal portals
- excessive red
- excessive cyan
- technology displayed as text only
- unrelated image placeholders
- excessive pill controls
- broad global mode selectors
- `transition: all`
