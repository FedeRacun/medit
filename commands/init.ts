import { CAC } from "cac";
import { createManifest, loadManifest, saveOriginalSnapshot } from "../core/manifest";
import { scanProject } from "../core/prprojParser";

export const registerInit = (cli: CAC) => {
  cli.command("init", "Inicializa un proyecto medit").action(async () => {
    console.log("🧠 Medit CLI v0.1");
    console.log("\n🔄 Inicializando proyecto medit...\n");
    const created = createManifest();

    if (!created) {
      console.log("❗ Ya existe un proyecto medit inicializado en esta carpeta.");
      return;
    }

    await scanProject({});

    const manifest = loadManifest();
    const missing = manifest.files.filter((f: { name: string; status: string }) => f.status === "missing");
    if (missing.length > 0) {
      console.log("⚠️ Se encontraron archivos faltantes, pero el proyecto fue inicializado igual.");
      console.log("   Usá 'medit sync' para descargarlos desde Drive.\n");
    }
    saveOriginalSnapshot(manifest);
    console.log("\n");
    console.log("✅ Proyecto medit inicializado correctamente.");
  });
};
