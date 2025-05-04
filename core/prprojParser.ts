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
		console.error(
			"❌ No se encontró ningún archivo .prproj en el directorio actual.",
		);
		return;
	}

	const prprojPath = options.file ? prprojFile : join(projectRoot, prprojFile);
	const rawBuffer = await fsPromises.readFile(prprojPath);
	const isGzipped = rawBuffer[0] === 0x1f && rawBuffer[1] === 0x8b;

	const foundMap = new Map<string, string>();
	console.log(`🎬 Archivo [.prproj]: ${path.basename(prprojPath)}`);
	console.log("🔦 Iniciando escaneo del proyecto...\n");

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
			console.warn(`⚠️ Error parseando (ignorado): ${err.message}`);
			parser.resume();
		});

		parser.on("end", () => {
			console.log(`📎 Archivos detectados: ${foundMap.size}`);
			console.log("   ↳ Uniendo nombres únicos y limpiando duplicados...\n");
			console.log(
				"💡 Escaneo completado\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
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
			console.log(`📂 Archivos pendientes de descarga [${missing.length}]:`);
			console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
			missing.forEach((f, i) =>
				console.log(`${String(i + 1).padStart(3, " ")}. ${f.name}`),
			);
		}

		console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log(`🔍 Total de archivos referenciados: ${files.length}`);
		console.log(`📁 Archivos descargados: ${downloaded}`);
		console.log(`❌ Archivos faltantes: ${missing.length}`);
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
	}
}
