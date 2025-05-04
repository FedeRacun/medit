import {
	createWriteStream,
	existsSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import os from "node:os";
import { join } from "node:path";
import { google } from "googleapis";

const TOKEN_PATH = join(os.homedir(), ".medit", "token.json");

const CLIENT_ID =
	"280376733373-9af71ejb16gr352l4skt1cdcdnaudfs4.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";

/**
 * Crea un cliente OAuth2, valida token, refresca si está vencido y actualiza el archivo.
 */
function loadOAuthClient() {
	if (!existsSync(TOKEN_PATH)) {
		console.error("❌ No estás autenticado con Google Drive.");
		console.error("👉 Ejecutá 'medit login' para vincular tu cuenta.");
		process.exit(1);
	}

	const token = JSON.parse(readFileSync(TOKEN_PATH, "utf-8"));

	const oAuth2Client = new google.auth.OAuth2(
		CLIENT_ID,
		CLIENT_SECRET,
		REDIRECT_URI,
	);

	oAuth2Client.setCredentials(token);

	oAuth2Client.on("tokens", (newTokens) => {
		if (newTokens.access_token) {
			const updated = { ...token, ...newTokens };
			writeFileSync(TOKEN_PATH, JSON.stringify(updated, null, 2));
			console.log("🔁 Token de acceso actualizado automáticamente.");
		}
	});

	return oAuth2Client;
}

export async function findFileInDrive(fileName: string) {
	const auth = loadOAuthClient();
	const drive = google.drive({ version: "v3", auth });

	const res = await drive.files.list({
		q: `name='${fileName.replace("'", "\\'")}' and trashed=false`,
		fields: "files(id, name, modifiedTime, parents)",
		pageSize: 1,
	});

	const file = res.data.files?.[0];
	if (!file) return null;

	return {
		id:
			file.id ??
			(() => {
				throw new Error("File ID is null or undefined.");
			})(),
		name:
			file.name ??
			(() => {
				throw new Error("File name is null or undefined.");
			})(),
		modifiedTime:
			file.modifiedTime ??
			(() => {
				throw new Error("File modifiedTime is null or undefined.");
			})(),
		parents: file.parents ?? [],
	};
}

export async function downloadFileFromDrive(
	fileId: string,
	destinationPath: string,
) {
	const auth = loadOAuthClient();
	const drive = google.drive({ version: "v3", auth });

	const meta = await drive.files.get({
		fileId,
		fields: "size, name",
	});

	const totalSize = Number.parseInt(meta.data.size || "0", 10);
	const fileName = meta.data.name;

	const dest = createWriteStream(destinationPath);
	const res = await drive.files.get(
		{ fileId, alt: "media" },
		{ responseType: "stream" },
	);

	let downloaded = 0;
	const start = Date.now();

	await new Promise<void>((resolve, reject) => {
		res.data
			.on("data", (chunk) => {
				downloaded += chunk.length;
				const percent = ((downloaded / totalSize) * 100).toFixed(2);
				const elapsed = (Date.now() - start) / 1000;
				const speed = downloaded / elapsed / 1024; // KB/s

				process.stdout.write(
					`\r📥 ${fileName} ${percent}% - ${speed.toFixed(1)} KB/s   `,
				);
			})
			.on("end", () => {
				process.stdout.write(`\r✅ ${fileName} 100% - completado\n`);
				resolve();
			})
			.on("error", (err) => {
				console.error("❌ Error al descargar:", err);
				reject(err);
			})
			.pipe(dest);
	});
}
