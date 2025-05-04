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
		console.log("✅ No pending files to sync.");
		return;
	}

	console.log(`🔄 Searching on Google Drive (${missingFiles.length} files)...`);

	for (const file of missingFiles) {
		console.log(`\n🔍 Searching: ${file.name}`);

		const found = await findFileInDrive(file.name);
		if (!found) {
			console.warn(`❌ Not found on Drive: ${file.name}`);
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

			console.log(`✅ File downloaded and updated: ${file.name}`);
		} catch (err) {
			console.error(`❌ Failed to download ${file.name}:`, err);
		}
	}

	saveManifest(manifest);
	console.log("\n📦 Sync complete.");
}
