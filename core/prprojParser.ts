import { join, basename, relative } from "path";
import { readdirSync, readFileSync, statSync } from "fs";
import { gunzipSync } from "zlib";
import { XMLParser } from "fast-xml-parser";
import { loadManifest, saveManifest } from "./manifest";
import { findFileRecursively } from "../utils/findFileRecursively";

export async function scanProject(options: { file?: string }) {
  const path = await import("path");
  const fs = await import("fs");

  const projectRoot = process.cwd();
  const prprojFile = options.file
    ? path.resolve(options.file)
    : readdirSync(projectRoot).find(f => f.endsWith(".prproj"));

  if (!prprojFile) {
    console.error("❌ No se encontró ningún archivo .prproj en el directorio actual.");
    return;
  }

  const prprojPath = options.file ? prprojFile : join(projectRoot, prprojFile);

  let rawXmlContent: string;
  try {
    const rawBuffer = readFileSync(prprojPath);
    const isGzipped = rawBuffer[0] === 0x1f && rawBuffer[1] === 0x8b;
    const xmlBuffer = isGzipped ? gunzipSync(rawBuffer) : rawBuffer;
    rawXmlContent = xmlBuffer.toString("utf-8");
  } catch {
    console.error("❌ No se pudo leer o descomprimir el archivo .prproj.");
    return;
  }

  const cleanXml = rawXmlContent
    .replace(/&(?!(amp|lt|gt|quot|apos);)/g, "&amp;")
    .replace(/\0/g, "")
    .replace(/<x:xmpmeta[\s\S]*?<\/x:xmpmeta>/g, "");

  const parser = new XMLParser({
    ignoreAttributes: false,
    allowBooleanAttributes: true,
    trimValues: true,
    parseTagValue: true,
    parseAttributeValue: true
  });

  let parsed: any;
  try {
    parsed = parser.parse(cleanXml);
  } catch {
    console.error("❌ Error al parsear el archivo .prproj.");
    return;
  }

  // 🔁 Deduplicación por nombre
  const nameSet = new Set<string>();
  const rawPaths: string[] = [];

  const walk = (obj: any) => {
    for (const key in obj) {
      const val = obj[key];
      if (typeof val === "string" && val.match(/\.(mp4|mov|wav|jpg|png|mp3|psd)$/i)) {
        const name = path.basename(val).toLowerCase();
        if (!nameSet.has(name)) {
          nameSet.add(name);
          rawPaths.push(val);
        }
      } else if (typeof val === "object" && val !== null) {
        walk(val);
      }
    }
  };
  walk(parsed);

  const manifest = loadManifest();
  const files = rawPaths.map(raw => {
    const name = basename(raw);
    const foundPath = findFileRecursively(projectRoot, name);
    const exists = !!foundPath;
    const absolute_path = foundPath ?? join(projectRoot, `media/${name}`);
    const local_path = relative(projectRoot, absolute_path);
    const stat = exists ? statSync(absolute_path) : null;

    return {
      name,
      local_path,
      absolute_path,
      source_in_project: raw,
      status: exists ? "downloaded" : "missing",
      hash: null,
      size: exists && stat ? stat.size : null,
      last_modified: exists && stat ? stat.mtime.toISOString() : null,
      drive_id: null,
      drive_path: null,
      drive_last_modified: null,
      conflict: false,
      version_history: []
    };
  });

  manifest.files = files;
  saveManifest(manifest);

  const missing = files.filter(f => f.status === "missing");
  const downloaded = files.length - missing.length;

  if (missing.length > 0) {
    console.log(`🔍 Archivos Pendientes:  [${missing.length}]`);
    missing.forEach(f => {
      console.log(` - ${f.name}`);
    });
  }

  if (downloaded > 0) {
    console.log(`\n📦 Archivos Descargados: [${downloaded}]`);
    files.filter(f => f.status === "downloaded").forEach(f => {
      console.log(` - ${f.name}`);
    });
  }

  console.log(`\n`);
  // console.log(`[${downloaded}] Descargados`);
  // console.log(`[${missing.length}] Pendientes`);
  console.log(`[${files.length}] Total`);
  console.log(`\n`);
}
