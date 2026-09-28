import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(root, "..", "lovable-skills", "skills", "jevify");
await mkdir(target, { recursive: true });
for (const name of ["VERSION.md", "LICENSE"]) await copyFile(resolve(root, name), resolve(target, name));
await copyFile(resolve(root, "skills", "jevify", "SKILL.md"), resolve(target, "SKILL.md"));
await writeFile(resolve(target, "README.md"), `# jevify catalog mirror\n\nGenerated from [lucioamor/jevify](https://github.com/lucioamor/jevify). Never edit this folder directly. Import the generated Lovable repository at [lucioamor/lovable-skill-jevify](https://github.com/lucioamor/lovable-skill-jevify).\n\nVersion: \`v1.3.0\`. License: CC BY 4.0. Created by Lucio Amorim.\n`, "utf8");
console.log(`Exported jevify to ${target}`);
