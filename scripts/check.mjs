import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const read = (p) => readFile(resolve(root, p), "utf8");
const skill = await read("skills/jevify/SKILL.md");
const front = skill.match(/^---\n([\s\S]*?)\n---/);
if (!front) errors.push("SKILL.md frontmatter missing");
const name = front?.[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
const description = front?.[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
if (!name) errors.push("frontmatter name missing");
if (!description) errors.push("frontmatter description missing");
if (description && [...description].length > 300) errors.push(`description is ${[...description].length} characters (max 300)`);
const skillVersion = skill.match(/Version: `v(\d+\.\d+\.\d+)`/)?.[1];
const versionVersion = (await read("VERSION.md")).match(/Current version: `v(\d+\.\d+\.\d+)`/)?.[1];
const pluginVersion = JSON.parse(await read(".claude-plugin/plugin.json")).version;
if (!skillVersion || skillVersion !== versionVersion || skillVersion !== pluginVersion) errors.push(`version mismatch: skill=${skillVersion}, VERSION=${versionVersion}, plugin=${pluginVersion}`);

const all = [];
async function walk(dir) { for (const entry of await readdir(dir, { withFileTypes: true })) { if ([".git", "node_modules", "reviews", ".agents"].includes(entry.name) || (dir === root && entry.name === "launch")) continue; const p=resolve(dir,entry.name); entry.isDirectory() ? await walk(p) : all.push(p); } }
await walk(root);
const forbidden = [/Nothing leaves your machine/i, /nothing leaves the project/i, /does not connect to a JEV/i, /\bjev-\d/i];
for (const p of all) { if (p === resolve(root, "scripts", "check.mjs")) continue; const text=await readFile(p,"utf8").catch(()=>null); if(text===null) continue; for(const rx of forbidden) if(rx.test(text)) errors.push(`forbidden phrase ${rx} in ${p.slice(root.length+1)}`); }

for (const p of all.filter((p)=>extname(p).toLowerCase()===".md")) { const text=await readFile(p,"utf8"); for(const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) { const href=m[1].trim().replace(/^<|>$/g,"").split("#")[0]; if(!href || /^(https?:|mailto:)/i.test(href)) continue; const target=resolve(dirname(p),decodeURIComponent(href)); try { await stat(target); } catch { errors.push(`broken relative link in ${p.slice(root.length+1)}: ${m[1]}`); } } }

const fixtureNames=(await readdir(resolve(root,"evals","fixtures"))).filter((x)=>/\.ts$/.test(x)).sort();
const expected=JSON.parse(await read("evals/expected.json"));
const expectedNames=Object.keys(expected).sort();
if(JSON.stringify(fixtureNames)!==JSON.stringify(expectedNames)) errors.push(`expected.json coverage mismatch: fixtures=${fixtureNames.join(",")} expected=${expectedNames.join(",")}`);
if(errors.length){ console.error(errors.join("\n")); process.exit(1); }
console.log(`check passed: ${fixtureNames.length} fixtures, version v${skillVersion}, description ${[...description].length}/300`);
