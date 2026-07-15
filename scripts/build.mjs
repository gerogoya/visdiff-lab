import { mkdir, rm, copyFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await mkdir(join(dist, "server"), { recursive: true });
await mkdir(join(dist, ".openai"), { recursive: true });
await copyFile(join(root, "src", "worker.js"), join(dist, "_worker.js"));
await copyFile(join(root, "src", "worker.js"), join(dist, "server", "index.js"));
await copyFile(join(root, ".openai", "hosting.json"), join(dist, ".openai", "hosting.json"));
await writeFile(join(dist, "README.txt"), "Visdiff Lab Cloudflare Pages Worker build.\n");

console.log("Built dist/server/index.js and dist/_worker.js");
