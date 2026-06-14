// Generates glyph-on-tile icons from icons.config.mjs.
//
// For each project it emits three variants in three formats, following the repo's
// dashboard-icons naming convention:
//   <name>.<ext>        coloured  - accent tile + white glyph (default)
//   <name>-light.<ext>  light     - white glyph,  transparent (for dark backgrounds)
//   <name>-dark.<ext>   dark      - dark glyph,   transparent (for light backgrounds)
// where <ext> is svg (svg/), png (png/), and webp (webp/). SVG is the source of
// truth; PNG and WebP are rasterized from it with sharp for consumers that can't
// render SVG.
//
// Glyphs come from the lucide-static package, so every icon shares one stroke
// style.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lucideDir = join(root, "node_modules", "lucide-static", "icons");

// Tile geometry (256x256 canvas, glyph centred in a 128px box).
const TILE = 256;
const RADIUS = 56;
const GLYPH = 128;
const SCALE = GLYPH / 24; // Lucide glyphs use a 24x24 viewBox.
const OFFSET = (TILE - GLYPH) / 2;
const RASTER = 256; // px size of the PNG / WebP output.

const WHITE = "#ffffff";
const SLATE = "#1f2933";

function loadGlyph(name) {
  let svg;
  try {
    svg = readFileSync(join(lucideDir, `${name}.svg`), "utf8");
  } catch {
    throw new Error(
      `Unknown Lucide glyph "${name}". Search names at https://lucide.dev`,
    );
  }
  const inner = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  if (!inner) throw new Error(`Could not parse Lucide glyph "${name}".`);
  return inner[1].trim();
}

// Rewrites the gallery table in README.md between the icons:start/end markers.
function updateReadme(icons) {
  const readme = join(root, "README.md");
  const start = "<!-- icons:start";
  const end = "<!-- icons:end -->";
  let md;
  try {
    md = readFileSync(readme, "utf8");
  } catch {
    return; // No README to update.
  }
  const startIdx = md.indexOf(start);
  const endIdx = md.indexOf(end);
  if (startIdx === -1 || endIdx === -1) return; // Markers missing; leave it alone.

  const rows = [...icons]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      ({ name, glyph, accent }) =>
        `| <img src="png/${name}.png" width="48" alt="${name}"> | \`${name}\` | \`${glyph}\` | \`${accent}\` |`,
    )
    .join("\n");

  const table =
    "| Icon | Service | Glyph | Accent |\n" +
    "|:----:|---------|-------|--------|\n" +
    rows;

  const head = md.slice(0, md.indexOf("-->", startIdx) + 3);
  const tail = md.slice(endIdx);
  writeFileSync(readme, `${head}\n\n${table}\n\n${tail}`);
}

function render(inner, { tile, stroke }) {
  const rect = tile
    ? `\n  <rect width="${TILE}" height="${TILE}" rx="${RADIUS}" fill="${tile}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}" width="${TILE}" height="${TILE}">${rect}
  <g transform="translate(${OFFSET} ${OFFSET}) scale(${SCALE})" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</g>
</svg>
`;
}

async function main() {
  const { default: icons } = await import(join(root, "icons.config.mjs"));
  const dirs = {
    svg: join(root, "svg"),
    png: join(root, "png"),
    webp: join(root, "webp"),
  };
  for (const dir of Object.values(dirs)) mkdirSync(dir, { recursive: true });

  let count = 0;
  for (const { name, glyph, accent } of icons) {
    const inner = loadGlyph(glyph);
    const variants = {
      "": { tile: accent, stroke: WHITE },
      "-light": { tile: null, stroke: WHITE },
      "-dark": { tile: null, stroke: SLATE },
    };
    for (const [suffix, opts] of Object.entries(variants)) {
      const base = `${name}${suffix}`;
      const svg = render(inner, opts);
      writeFileSync(join(dirs.svg, `${base}.svg`), svg);

      // Rasterize from the SVG. resvg (via sharp) reads the 256px canvas; resize
      // is a no-op at RASTER=256 but keeps the output size explicit/configurable.
      const raster = sharp(Buffer.from(svg)).resize(RASTER, RASTER);
      await raster
        .clone()
        .png({ compressionLevel: 9 })
        .toFile(join(dirs.png, `${base}.png`));
      await raster
        .clone()
        .webp({ quality: 90 })
        .toFile(join(dirs.webp, `${base}.webp`));
      count++;
    }
    console.log(`✓ ${name}  (glyph: ${glyph}, accent: ${accent})`);
  }
  updateReadme(icons);
  console.log(
    `\nGenerated ${count} icons × 3 formats (svg/, png/, webp/) = ${count * 3} files; updated README gallery.`,
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
