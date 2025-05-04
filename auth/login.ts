import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { google } from "googleapis";
import { jwtDecode } from "jwt-decode";

if (!os.homedir())
	throw new Error("Could not determine the user's home directory.");

const TOKEN_DIR = join(os.homedir(), ".medit");
const TOKEN_PATH = join(TOKEN_DIR, "token.json");
const CONFIG_PATH = join(TOKEN_DIR, "config.json");

// Replace with your client_id and client_secret
const CLIENT_ID =
	"280376733373-9af71ejb16gr352l4skt1cdcdnaudfs4.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob"; // console flow (no server)

const SCOPES = [
	"https://www.googleapis.com/auth/drive.readonly",
	"openid",
	"email",
	"profile",
];

type IdTokenPayload = {
	email?: string;
	name?: string;
	picture?: string;
};

export async function loginWithGoogle() {
	const oAuth2Client = new google.auth.OAuth2(
		CLIENT_ID,
		CLIENT_SECRET,
		REDIRECT_URI,
	);

	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: "offline",
		scope: SCOPES,
		prompt: "consent",
	});

	console.log("📎 Open this URL in your browser and authorize the app:");
	console.log(authUrl);

	const code = await ask("📥 Paste the code provided by Google: ");
	const { tokens } = await oAuth2Client.getToken(code);
	oAuth2Client.setCredentials(tokens);

	if (!existsSync(TOKEN_DIR)) mkdirSync(TOKEN_DIR);

	writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
	console.log("✅ Login successful. Token saved at ~/.medit/token.json");

	if (tokens.id_token) {
		try {
			const info = jwtDecode<IdTokenPayload>(tokens.id_token);
			const config = {
				name: info.name ?? null,
				email: info.email ?? null,
			};

			writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

			if (config.name || config.email) {
				console.log(
					`👤 Authenticated user: ${config.name ?? "unknown"} <${config.email ?? "no email"}>`,
				);
			} else {
				console.log("👤 Authenticated user (no profile info)");
			}

			console.log("📝 Config saved at ~/.medit/config.json");
		} catch (err) {
			console.warn("⚠️ Could not decode id_token to save profile information.");
		}
	}
}

function ask(question: string): Promise<string> {
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) =>
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer);
		}),
	);
}
