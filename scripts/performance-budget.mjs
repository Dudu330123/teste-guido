import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const guideRoot = path.join(projectRoot, "public", "images", "guide-screens");
const homeRoot = path.join(projectRoot, "public", "images", "home");
const guideBudget = 40 * 1024 * 1024;
const homeCriticalBudget = 3 * 1024 * 1024;
const criticalHomeAssets = [
  "cenario-home.webp",
  "cenario-home-dark.webp",
  "mascote-guido-dark.webp",
  "mascote-guido-bicolor.webp",
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(file));
    else files.push(file);
  }
  return files;
}

const guideFiles = await walk(guideRoot);
const guideStats = await Promise.all(guideFiles.map(async (file) => ({ file, ...(await stat(file)) })));
const guideBytes = guideStats.reduce((total, file) => total + file.size, 0);
const guidePngs = guideFiles.filter((file) => file.toLowerCase().endsWith(".png"));
const largestGuide = guideStats.toSorted((first, second) => second.size - first.size)[0];

if (guidePngs.length > 0) {
  throw new Error(`Orçamento de imagens: ainda existem ${guidePngs.length} PNG(s) nos guias.`);
}
if (guideBytes > guideBudget) {
  throw new Error(`Orçamento de imagens: guide-screens usa ${(guideBytes / 1024 / 1024).toFixed(1)} MB; limite ${(guideBudget / 1024 / 1024).toFixed(0)} MB.`);
}

let criticalHomeBytes = 0;
for (const asset of criticalHomeAssets) {
  const file = path.join(homeRoot, asset);
  criticalHomeBytes += (await stat(file)).size;
}
if (criticalHomeBytes > homeCriticalBudget) {
  throw new Error(`Orçamento inicial: assets críticos da home usam ${(criticalHomeBytes / 1024 / 1024).toFixed(1)} MB; limite ${(homeCriticalBudget / 1024 / 1024).toFixed(0)} MB.`);
}

console.log(`Orçamento de performance aprovado: ${guideFiles.length} telas WebP (${(guideBytes / 1024 / 1024).toFixed(1)} MB), maior ${(largestGuide.size / 1024).toFixed(0)} KB.`);
console.log(`Assets críticos da home: ${(criticalHomeBytes / 1024).toFixed(0)} KB.`);
