import type { CAC } from "cac";
import { getUserConfig } from "../core/config";

export function registerUser(cli: CAC) {
	cli.command("user", "Obtiene informacion").action(getUserConfig);
}
