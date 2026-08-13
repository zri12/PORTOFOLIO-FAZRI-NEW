import sharp from "sharp";

await sharp("src/imports/fazri.png")
  .resize({ width: 1200, withoutEnlargement: true })
  .webp({ quality: 82, effort: 6 })
  .toFile("src/imports/fazri.webp");
