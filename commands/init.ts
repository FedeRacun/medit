import { CAC } from "cac";
import { createManifest, loadManifest, saveOriginalSnapshot } from "../core/manifest";
import { scanProject } from "../core/prprojParser";

export const registerInit = (cli: CAC) => {
  cli.command("init", "Inicializa un proyecto medit").action(async () => {
    const created = createManifest();

    if (!created) {
      console.log("❗ Ya existe un proyecto medit inicializado en esta carpeta.");
      return;
    }

    console.log("🔍 Escaneando proyecto...");
    await scanProject({});

    const manifest = loadManifest();
    const missing = manifest.files.filter((f: { name: string; status: string }) => f.status === "missing");

    if (missing.length > 0) {
      console.log("⚠️ Se encontraron archivos faltantes, pero el proyecto fue inicializado igual.");
      console.log("   Usá `medit sync` para descargarlos desde Drive.\n");
      missing.forEach((f: { name: string; status: string }) => console.log(` - ${f.name}`));
    }

    saveOriginalSnapshot(manifest);
    console.log("✅ Proyecto medit inicializado correctamente.");
  });
};
