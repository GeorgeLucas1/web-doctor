import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

export async function scanDirectory(dir: string) {
	const filesFound: string[] = [];
	const targetExtensions = [".html", ".css", ".js"];

	async function recursiveScan(currentPath: string) {
		const files = await readdir(currentPath);

		for (const file of files) {
			const fullPath = join(currentPath, file);

			if (file === "node_modules" || file === ".git") continue;

			const fileStat = await stat(fullPath);

			if (fileStat.isDirectory()) await recursiveScan(fullPath);
			else {
				const isTarget = targetExtensions.some(ext => file.endsWith(ext));
				if (isTarget) filesFound.push(fullPath);
			}
		}
	}

	await recursiveScan(dir);
	return filesFound;
}
