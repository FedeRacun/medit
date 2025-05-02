import { existsSync, readFileSync } from "fs";
import { join } from "path";
import os from "os";

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
    console.error("⚠️ No se pudo leer o parsear ~/.medit/config.json");
    return null;
  }
}