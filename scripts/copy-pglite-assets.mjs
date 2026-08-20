import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
const destDir = join(root, ".vercel/output/functions/__server.func/_libs");
const files = ["pglite.data", "pglite.wasm", "initdb.wasm"];

if (!existsSync(destDir)) {
  console.log("[pglite-assets] no nitro output yet — skip");
  process.exit(0);
}
mkdirSync(destDir, { recursive: true });
for (const name of files) {
  copyFileSync(join(srcDir, name), join(destDir, name));
  console.log("[pglite-assets] copied", name);
}
