import { createInterface } from "readline";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { google } from "googleapis";
import os from "os";
import { jwtDecode } from "jwt-decode";

if (!os.homedir()) throw new Error("No se pudo determinar el directorio home del usuario.");

const TOKEN_DIR = join(os.homedir(), ".medit");
const TOKEN_PATH = join(TOKEN_DIR, "token.json");
const CONFIG_PATH = join(TOKEN_DIR, "config.json");

// Reemplazá con tu client_id y client_secret
const CLIENT_ID = "280376733373-9af71ejb16gr352l4skt1cdcdnaudfs4.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob"; // flujo consola (sin servidor)

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "openid",
  "email",
  "profile"
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

  if (tokens.id_token) {
    try {
      const info = jwtDecode<IdTokenPayload>(tokens.id_token);
      const config = {
        name: info.name ?? null,
        email: info.email ?? null,
      };

      writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

      if (config.name || config.email) {
        console.log(`👤 Usuario autenticado: ${config.name ?? "desconocido"} <${config.email ?? "sin email"}>`);
      } else {
        console.log("👤 Usuario autenticado (sin info de perfil)");
      }

      console.log("📝 Configuración guardada en ~/.medit/config.json");
    } catch (err) {
      console.warn("⚠️ No se pudo decodificar el id_token para guardar el perfil.");
    }
  }
}

function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => {
    rl.close();
    resolve(answer);
  }));
}
