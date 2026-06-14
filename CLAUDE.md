# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a **public** repo whose only job is to host icons for the user's
**private** personal projects (the `ghcr.io/sazap10/*` apps — `holidays`,
`wealth-tracker`, `flame`, etc.). It exists so the homelab dashboard can display
those icons.

Why a separate repo: the homelab's **Flame** dashboard
(`../homelab/machines/normandy/compose/flame/`) lets each service set a
`flame.icon:` label, which can be a URL. jsDelivr/raw GitHub URLs only serve
**public** repos, but the projects' own source repos are private — so their icons
can't be fetched directly. This public repo fills that gap. Keeping it public is
the whole point; do not make it private.

Icons are not hand-drawn: they are **generated** as a cohesive glyph-on-tile set
from [Lucide](https://lucide.dev) glyphs (`npm run generate`, see below). There is
no other build, lint, or test. The work is editing `icons.config.mjs`, running the
generator, and keeping naming consistent.

## Consumption contract

Icons are referenced from the homelab via jsDelivr:

```
https://cdn.jsdelivr.net/gh/sazap10/personal-project-icons@main/svg/<service>.svg
```

That URL goes in the `flame.icon:` label on the service's `compose.yaml` in the
homelab repo. jsDelivr serves SVGs with the correct `image/svg+xml` content-type.

**Cache caveat:** jsDelivr caches `@main` aggressively (up to ~7 days). After
replacing an icon in place, the old one can persist. To force a refresh, either
pin a tag/commit ref instead of `@main`, or hit jsDelivr's purge endpoint
(`https://purge.jsdelivr.net/gh/sazap10/personal-project-icons@main/svg/<service>.svg`).

## Layout & naming

The generator writes coloured/light/dark variants in three formats (`svg/`,
`png/`, `webp/`), using the
[dashboard-icons](https://github.com/walkxcode/dashboard-icons) suffix convention
(the same scheme Flame already understands):

```
svg/<service>.svg          coloured – accent tile + white glyph (default)
svg/<service>-light.svg    light    – white glyph, transparent (dark backgrounds)
svg/<service>-dark.svg     dark     – dark glyph,  transparent (light backgrounds)
png/<service>*.png         PNG  raster of each variant (256px, transparent)
webp/<service>*.webp       WebP raster of each variant (256px, transparent)
```

- **SVG is the source of truth**; PNG and WebP are rasterized from it (256px) for
  consumers that can't render SVG. All three formats are committed and served.
- `<service>` must match the homelab tsdproxy/service name **exactly** (e.g.
  `holidays`, `wealth-tracker`, `flame`) so the URL is predictable from the
  service name. This is the `name` field in `icons.config.mjs`.

## Project structure

- `icons.config.mjs` — the source of truth: one `{ name, glyph, accent }` entry
  per project. `glyph` is a [Lucide](https://lucide.dev) icon name; `accent` is
  the coloured-variant tile colour. **Use Lucide glyphs only** so the set stays a
  cohesive family; pick the blunter metaphor (legible at ~48px).
- `scripts/generate.mjs` — composes the glyph-on-tile and emits the three SVG
  variants. Pulls glyphs from the `lucide-static` dev dependency.

## Adding or changing an icon

1. Add/edit an entry in `icons.config.mjs`.
2. `npm install` (first time), then `npm run generate` — (re)writes that service's
   variants across `svg/`, `png/`, and `webp/`. Verify a Lucide glyph name at
   https://lucide.dev if the generator reports it as unknown.
3. In the **homelab** repo, point that service's `flame.icon:` label at the
   matching jsDelivr URL.
