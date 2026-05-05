/**
 * Crops your board photo into shop-ready JPEGs next to the SVG placeholders.
 *
 * 1. Put the original image in public/products/source/ (e.g. board.jpg).
 * 2. Copy manifest.example.json → manifest.json and set pixel rectangles
 *    (left, top, width, height) for each output file — match powder vs cream regions.
 * 3. npm run crop-products
 * 4. Set useRasterProductImages = true in src/lib/productMedia.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const productsDir = path.join(root, "public", "products");
const sourceDir = path.join(productsDir, "source");
const manifestPath = path.join(sourceDir, "manifest.json");

async function main() {
  if (!fs.existsSync(manifestPath)) {
    console.warn(
      "Missing public/products/source/manifest.json — copy manifest.example.json, add your source filename and crop rectangles, then run again.",
    );
    process.exit(0);
  }
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("Install sharp: npm install sharp --save-dev");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const sourceFile = manifest.source;
  if (!sourceFile || typeof sourceFile !== "string") {
    console.error("manifest.json must include \"source\": \"your-file.jpg\"");
    process.exit(1);
  }
  const inputPath = path.join(sourceDir, sourceFile);
  if (!fs.existsSync(inputPath)) {
    console.error("Source image not found:", inputPath);
    process.exit(1);
  }
  const crops = manifest.crops;
  if (!crops || typeof crops !== "object") {
    console.error("manifest.json must include a \"crops\" object");
    process.exit(1);
  }

  for (const [filename, rect] of Object.entries(crops)) {
    const { left, top, width, height } = rect;
    if ([left, top, width, height].some((n) => typeof n !== "number" || n < 0)) {
      console.error("Invalid crop for", filename, rect);
      process.exit(1);
    }
    const outPath = path.join(productsDir, filename);
    await sharp(inputPath)
      .extract({ left, top, width, height })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(outPath);
    console.log("Wrote", path.relative(root, outPath));
  }
  console.log("Done. Set useRasterProductImages = true in src/lib/productMedia.ts");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
