import type { CAC } from "cac";
import { loginWithGoogle } from "../auth/login";

export function registerLogin(cli: CAC) {
	cli.command("login", "Autenticarse con Google Drive").action(loginWithGoogle);
}
