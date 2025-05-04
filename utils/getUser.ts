import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import { join } from "node:path";

const CONFIG_PATH = join(os.homedir(), ".medit", "config.json");

export type UserConfig = {
	name?: string;
	email?: string;
};

export function getUser(): UserConfig | null {
	if (!existsSync(CONFIG_PATH)) {
		return null;
	}

	try {
		const raw = readFileSync(CONFIG_PATH, "utf-8");
		return JSON.parse(raw);
	} catch {
		console.error("⚠️ Failed to read or parse ~/.medit/config.json");
		return null;
	}
}
