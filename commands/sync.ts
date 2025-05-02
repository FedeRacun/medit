import { CAC } from "cac";
import { syncMissingFiles } from "../core/sync";

export function registerSync(cli: CAC) {
  cli.command("sync", "Descarga archivos faltantes desde Google Drive").action(syncMissingFiles);
}
