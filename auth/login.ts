import { createInterface } from "readline";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { google } from "googleapis";

const TOKEN_DIR = join(process.env.HOME!, ".medit");
const TOKEN_PATH = join(TOKEN_DIR, "token.json");

// Reemplazá con tu client_id y client_secret
const CLIENT_ID = "280376733373-9af71ejb16gr352l4skt1cdcdnaudfs4.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob"; // flujo consola (sin servidor)

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

export async function loginWithGoogle() {
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("📎 Abrí esta URL en tu navegador y autorizá la app:");
  console.log(authUrl);

  const code = await ask("📥 Pegá el código que te dio Google: ");
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  if (!existsSync(TOKEN_DIR)) mkdirSync(TOKEN_DIR);
  writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

  console.log("✅ Login exitoso. Token guardado en ~/.medit/token.json");
}

function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => {
    rl.close();
    resolve(answer);
  }));
}
