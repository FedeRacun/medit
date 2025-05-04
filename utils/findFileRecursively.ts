import { readdirSync } from "node:fs";
import { join } from "node:path";

export function findFileRecursively(
	root: string,
	filename: string,
): string | null {
	const entries = readdirSync(root, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = join(root, entry.name);
		if (entry.isDirectory()) {
			const found = findFileRecursively(fullPath, filename);
			if (found) return found;
		} else if (entry.name === filename) {
			return fullPath;
		}
	}

	return null;
}
