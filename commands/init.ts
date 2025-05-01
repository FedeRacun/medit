import { CAC } from "cac";
import { createManifest } from "../core/manifest";

export const registerInit = (cli: CAC) => {
  cli.command("init", "Inicializa un proyecto medit").action(() => {
    const created = createManifest();
    if (created) {
      console.log("✅ Proyecto medit inicializado correctamente.");
    } else {
      console.log("❗ Ya existe un proyecto medit inicializado en esta carpeta.");
    }
  });
};
