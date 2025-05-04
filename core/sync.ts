import { statSync } from "node:fs";
import { downloadFileFromDrive, findFileInDrive } from "../auth/drive";
import type { ManifestFile } from "../utils/interfaces/manifest.interfaces";
import { loadManifest, saveManifest } from "./manifest";

export async function syncMissingFiles() {
	const manifest = loadManifest();

	const missingFiles = manifest.files.filter(
		(f: ManifestFile) => f.status === "missing",
	);

	if (missingFiles.length === 0) {
		console.log("✅ No hay archivos pendientes.");
		return;
	}

	console.log(
		`🔄 Buscando en Google Drive (${missingFiles.length} archivos)...`,
	);

	for (const file of missingFiles) {
		console.log(`\n🔍 Buscando: ${file.name}`);

		const found = await findFileInDrive(file.name);
		if (!found) {
			console.warn(`❌ No se encontró en Drive: ${file.name}`);
			continue;
		}

		try {
			await downloadFileFromDrive(found.id, file.absolute_path);

			const stat = statSync(file.absolute_path);
			file.status = "downloaded";
			file.size = stat.size;
			file.last_modified = stat.mtime.toISOString();
			file.drive_id = found.id;
			file.drive_path = `https://drive.google.com/file/d/${found.id}/view`;
			file.drive_last_modified = found.modifiedTime;
			file.conflict = false;

			console.log(`✅ Archivo descargado y actualizado: ${file.name}`);
		} catch (err) {
			console.error(`❌ Falló la descarga de ${file.name}:`, err);
		}
	}

	saveManifest(manifest);
	console.log("\n📦 Sincronización finalizada.");
}
