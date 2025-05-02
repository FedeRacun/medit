import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, basename } from "path";

const projectRoot = process.cwd();
const meditFolder = join(projectRoot, ".medit");
const manifestPath = join(meditFolder, "manifest.json");
const snapshotPath = join(meditFolder, "original_snapshot.json");

export function createManifest(): boolean {
  if (existsSync(meditFolder)) return false;

  mkdirSync(meditFolder);
  const manifest = {
    name: basename(projectRoot),
    created_at: new Date().toISOString(),
    medit_version: "0.1.0",
    files: []
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return true;
}

export function loadManifest() {
  return JSON.parse(readFileSync(manifestPath, "utf-8"));
}

export function saveManifest(data: any) {
  writeFileSync(manifestPath, JSON.stringify(data, null, 2));
}

export function saveOriginalSnapshot(data: any) {
  writeFileSync(snapshotPath, JSON.stringify(data, null, 2));
}
