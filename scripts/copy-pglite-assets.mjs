import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
const files = ["pglite.data", "pglite.wasm", "initdb.wasm"];
const destinations = [
  join(root, ".vercel/output/functions/__server.func/_libs"),
  join(root, ".netlify/functions-internal/server/_libs"),
].filter(existsSync);

if (destinations.length === 0) {
  console.log("[pglite-assets] no Nitro output yet — skip");
  process.exit(0);
}

for (const destDir of destinations) {
  mkdirSync(destDir, { recursive: true });
  for (const name of files) {
    copyFileSync(join(srcDir, name), join(destDir, name));
    console.log("[pglite-assets] copied", name, "to", destDir);
  }
}
