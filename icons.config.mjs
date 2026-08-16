// Icon definitions. Run `npm run generate` after editing.
//
// Each entry:
//   name   - MUST match the homelab tsdproxy/service name exactly. Becomes the
//            filename, e.g. "holidays" -> svg/holidays.svg (+ -light / -dark).
//   glyph  - a Lucide icon name. Browse and search at https://lucide.dev .
//   accent - brand colour for the tile fill in the coloured (default) variant.
//
// Keep glyphs from Lucide only, so every icon shares the same stroke style and
// the set reads as a cohesive family on the dashboard. Prefer the blunter
// metaphor — it has to be legible at ~48px.

export default [
  { name: "holidays", glyph: "tree-palm", accent: "#0ea5e9" },
  { name: "wealth-tracker", glyph: "trending-up", accent: "#16a34a" },
  { name: "flame", glyph: "flame", accent: "#f97316" },
  { name: "whitley-manager", glyph: "clipboard-list", accent: "#4f46e5" },
  { name: "world-cup-dashboard", glyph: "trophy", accent: "#eab308" },
  { name: "hindi-learning", glyph: "languages", accent: "#e11d48" },
];
