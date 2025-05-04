import type { CAC } from "cac";
import {
	createManifest,
	loadManifest,
	saveOriginalSnapshot,
} from "../core/manifest";
import { scanProject } from "../core/prprojParser";

export const registerInit = (cli: CAC) => {
	cli.command("init", "Initializes a medit project").action(async () => {
		console.log("🧠 Medit CLI v0.2");
		console.log("\n🔄 Initializing project...\n");
		const created = createManifest();

		if (!created) {
			console.log("❗ A medit project is already initialized in this folder.");
			return;
		}

		await scanProject({});

		const manifest = loadManifest();
		const missing = manifest.files.filter(
			(f: { name: string; status: string }) => f.status === "missing",
		);
		if (missing.length > 0) {
			console.log(
				"⚠️ Missing files were found, but the project was initialized anyway.",
			);
			console.log("   Use 'medit sync' to download them from Drive.\n");
		}
		saveOriginalSnapshot(manifest);
		console.log("\n");
		console.log("✅ Medit project successfully initialized.");
	});
};
