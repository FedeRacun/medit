import { join, basename, relative } from "path";
import { readdirSync, statSync, createReadStream } from "fs";
import { gunzipSync } from "zlib";
import { loadManifest, saveManifest } from "./manifest";
import { findFileRecursively } from "../utils/findFileRecursively";
import sax from "sax";

export async function scanProject(options: { file?: string }) {
  const path = await import("path");
  const fs = await import("fs/promises");

  const projectRoot = process.cwd();
  const prprojFile = options.file
    ? path.resolve(options.file)
    : readdirSync(projectRoot).find(f => f.endsWith(".prproj"));

  if (!prprojFile) {
    console.error("❌ No se encontró ningún archivo .prproj en el directorio actual.");
    return;
  }

  const prprojPath = options.file ? prprojFile : join(projectRoot, prprojFile);
  const rawBuffer = await fs.readFile(prprojPath);
  const isGzipped = rawBuffer[0] === 0x1f && rawBuffer[1] === 0x8b;

  const nameSet = new Set<string>();
  const rawPaths: string[] = [];

  console.log("⏳ Escaneando .prproj por stream...");

  const parser = sax.createStream(true, { trim: true });
  parser.on("text", (text: string) => {
    const extMatch = text.match(/\.(mp4|mov|wav|jpg|png|mp3|psd)$/i);
    if (extMatch) {
      const name = basename(text).toLowerCase();
      if (!nameSet.has(name)) {
        nameSet.add(name);
        rawPaths.push(text);
        process.stdout.write(`\r📎 Detectado: ${name} (${rawPaths.length})`);
      }
    }
  });

  parser.on("error", (err) => {
    console.warn(`⚠️ Error parseando (ignorado): ${err.message}`);
    parser.resume(); // Sigue leyendo en lugar de abortar
  });

  parser.on("end", () => {
    console.log("\n✅ Escaneo completado.");
    postProcess();
  });

  const stream = createReadStream(prprojPath);
  if (isGzipped) {
    // Usamos zlib en stream para descomprimir en tiempo real
    const zlib = await import("zlib");
    stream.pipe(zlib.createGunzip()).pipe(parser);
  } else {
    stream.pipe(parser);
  }

  function postProcess() {
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
      console.log(`📂 Archivos Pendientes:  [${missing.length}]`);
      missing.forEach(f => console.log(` - ${f.name}`));
    }

    if (downloaded > 0) {
      console.log(`\n📦 Archivos Descargados: [${downloaded}]`);
      files.filter(f => f.status === "downloaded").forEach(f => console.log(` - ${f.name}`));
    }

    console.log(`\n[${files.length}] Total\n`);
  }
}
