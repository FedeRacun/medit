import {
	createReadStream,
	existsSync,
	promises as fsPromises,
	mkdirSync,
	readdirSync,
	statSync,
} from "node:fs";
import path, { join, relative } from "node:path";
import sax from "sax";
import { findFileRecursively } from "../utils/findFileRecursively";
import { loadManifest, saveManifest } from "./manifest";

export async function scanProject(options: { file?: string }) {
	const projectRoot = process.cwd();
	const prprojFile = options.file
		? path.resolve(options.file)
		: readdirSync(projectRoot).find((f) => f.endsWith(".prproj"));

	if (!prprojFile) {
		console.error("❌ No .prproj file found in the current directory.");
		return;
	}

	const prprojPath = options.file ? prprojFile : join(projectRoot, prprojFile);
	const rawBuffer = await fsPromises.readFile(prprojPath);
	const isGzipped = rawBuffer[0] === 0x1f && rawBuffer[1] === 0x8b;

	const foundMap = new Map<string, string>();
	console.log(`🎬 Project file [.prproj]: ${path.basename(prprojPath)}`);
	console.log("🔦 Starting project scan...\n");

	const parser = sax.createStream(true, { trim: true });

	await new Promise<void>((resolve, _) => {
		parser.on("text", (text: string) => {
			const extMatch = text.match(/\.(mp4|mov|wav|jpg|png|mp3|psd)$/i);
			if (extMatch) {
				const name = text.split(/[/\\]/).pop();
				if (name) {
					const normalized = name.toLowerCase();
					if (!foundMap.has(normalized)) {
						foundMap.set(normalized, text);
					}
				}
			}
		});

		parser.on("error", (err) => {
			console.warn(`⚠️ Parse error (ignored): ${err.message}`);
			parser.resume();
		});

		parser.on("end", () => {
			console.log(`📎 Media files detected: ${foundMap.size}`);
			console.log("   ↳ Deduplicating and normalizing names...\n");
			console.log(
				"💡 Scan complete\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
			);
			postProcess();
			resolve();
		});

		const stream = createReadStream(prprojPath);
		if (isGzipped) {
			import("node:zlib").then((zlib) => {
				stream.pipe(zlib.createGunzip()).pipe(parser);
			});
		} else {
			stream.pipe(parser);
		}
	});

	function postProcess() {
		const manifest = loadManifest();

		const mediaDir = join(projectRoot, "media");
		if (!existsSync(mediaDir)) {
			mkdirSync(mediaDir, { recursive: true });
		}

		const files = [...foundMap.entries()].map(([name, raw]) => {
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
				version_history: [],
			};
		});

		manifest.files = files;
		saveManifest(manifest);

		const missing = files.filter((f) => f.status === "missing");
		const downloaded = files.length - missing.length;

		if (missing.length > 0) {
			console.log(`📂 Files pending download [${missing.length}]:`);
			console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
			missing.forEach((f, i) =>
				console.log(`${String(i + 1).padStart(3, " ")}. ${f.name}`),
			);
		}

		console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log(`🔍 Total referenced files: ${files.length}`);
		console.log(`📁 Downloaded files: ${downloaded}`);
		console.log(`❌ Missing files: ${missing.length}`);
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
	}
}
