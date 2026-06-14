# personal-project-icons

Public host for the icons of my **private** personal projects
(`ghcr.io/sazap10/*` — `holidays`, `wealth-tracker`, `flame`, …), so the
[homelab](../homelab) Flame dashboard can display them by URL.

Icons are generated as a cohesive **glyph-on-tile** set from
[Lucide](https://lucide.dev) glyphs, so they all share one stroke style and stay
legible at dashboard size (~48px).

## Layout

Each project gets three variants, in three formats:

```
svg/<service>.svg        coloured  – accent tile + white glyph (default)
svg/<service>-light.svg  light     – white glyph, transparent (dark backgrounds)
svg/<service>-dark.svg   dark      – dark glyph,  transparent (light backgrounds)
png/<service>*.png       PNG  raster of every variant (256px)
webp/<service>*.webp     WebP raster of every variant (256px)
```

SVG is the source of truth; PNG and WebP are rasterized from it. `<service>`
matches the homelab tsdproxy/service name exactly.

## Use from the homelab

Set the `flame.icon:` label on the service's `compose.yaml` to a jsDelivr URL:

```yaml
labels:
  flame.icon: https://cdn.jsdelivr.net/gh/sazap10/personal-project-icons@main/svg/holidays.svg
```

> jsDelivr caches `@main` for up to ~7 days. After replacing an icon, purge with
> `https://purge.jsdelivr.net/gh/sazap10/personal-project-icons@main/svg/<service>.svg`
> or reference a pinned tag/commit instead of `@main`.

## Add or change an icon

1. Add an entry to [`icons.config.mjs`](icons.config.mjs):
   ```js
   { name: "my-service", glyph: "wallet", accent: "#16a34a" },
   ```
   - `name` = the homelab service name. `glyph` = a [Lucide](https://lucide.dev)
     icon name. `accent` = tile colour for the coloured variant.
2. Generate the variants:
   ```sh
   npm install   # first time only
   npm run generate
   ```
   This (re)writes the coloured/light/dark variants for every project across
   `svg/`, `png/`, and `webp/`.
3. Commit and push, then point the homelab service's `flame.icon` at the new URL.
