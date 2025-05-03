import { CAC } from "cac";
import { scanProject } from "../core/prprojParser";

export const registerScan = (cli: CAC) => {
  cli
    .command("scan", "Escanea el archivo .prproj y extrae dependencias multimedia")
    .option("--file <path>", "Ruta al archivo .prproj (opcional)")
    .action(scanProject);

    cli.command("status", "Escanea el archivo .prproj y extrae dependencias multimedia")
    .option("--file <path>", "Ruta al archivo .prproj (opcional)")
    .action(scanProject)
};
