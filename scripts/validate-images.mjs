import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const imageRoot = path.join(projectRoot, "public", "images", "guide-screens");
const manifestPath = path.join(projectRoot, "src", "data", "local-guide-images.ts");
const maxBytes = 10 * 1024 * 1024;
const maxDimension = 8192;
const acceptedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function dimensionsFromBuffer(buffer, extension) {
  if (extension === ".png" && buffer.length >= 24 && buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if ((extension === ".jpg" || extension === ".jpeg") && buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      offset += 2;
      if (marker === 0xd8 || marker === 0xd9) continue;
      if (offset + 2 > buffer.length) break;
      const segmentLength = buffer.readUInt16BE(offset);
      if (segmentLength < 2 || offset + segmentLength > buffer.length) break;
      const isSof = marker >= 0xc0 && marker <= 0xc3 || marker >= 0xc5 && marker <= 0xc7 || marker >= 0xc9 && marker <= 0xcb || marker >= 0xcd && marker <= 0xcf;
      if (isSof && offset + 7 <= buffer.length) return { width: buffer.readUInt16BE(offset + 5), height: buffer.readUInt16BE(offset + 3) };
      offset += segmentLength;
    }
  }

  if (extension === ".webp" && buffer.length >= 30 && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") {
    const chunk = buffer.subarray(12, 16).toString();
    if (chunk === "VP8X") return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
    if (chunk === "VP8 " && buffer.length >= 30) return { width: buffer.readUInt16LE(26), height: buffer.readUInt16LE(28) };
    if (chunk === "VP8L" && buffer.length >= 25) return { width: 1 + (buffer[21] | ((buffer[22] & 0x3f) << 8)), height: 1 + ((buffer[22] >> 6) | (buffer[23] << 2) | ((buffer[24] & 0x0f) << 10)) };
  }

  return null;
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

async function main() {
  const files = await walk(imageRoot);
  if (files.length === 0) throw new Error("Nenhuma imagem encontrada em public/images/guide-screens.");

  for (const file of files) {
    const extension = path.extname(file).toLowerCase();
    if (!acceptedExtensions.has(extension)) throw new Error(`Extensão não permitida: ${path.relative(projectRoot, file)}`);
    const fileInfo = await stat(file);
    if (fileInfo.size === 0 || fileInfo.size > maxBytes) throw new Error(`Tamanho inválido: ${path.relative(projectRoot, file)}`);
    const dimensions = dimensionsFromBuffer(await readFile(file), extension);
    if (!dimensions || dimensions.width < 1 || dimensions.height < 1 || dimensions.width > maxDimension || dimensions.height > maxDimension) {
      throw new Error(`Dimensões ou assinatura inválidas: ${path.relative(projectRoot, file)}`);
    }
  }

  const manifest = await readFile(manifestPath, "utf8");
  const references = [...manifest.matchAll(/:\s*"(\/images\/guide-screens\/[^"]+)"/g)].map((match) => match[1]);
  if (references.length === 0) throw new Error("O mapa local de imagens não possui referências.");
  for (const reference of references) {
    const target = path.join(projectRoot, "public", reference.replace(/^\//, ""));
    try { await stat(target); } catch { throw new Error(`Imagem do mapa não encontrada: ${reference}`); }
  }

  console.log(`Imagens válidas: ${files.length}`);
  console.log(`Referências verificadas: ${references.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
