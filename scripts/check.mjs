// Repository checks for the canonical jevify skill. Node only, no dependencies.
import { createHash } from "node:crypto";
import { access, readFile, readdir, stat } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const read = (p) => readFile(resolve(root, p), "utf8");
const rel = (p) => p.slice(root.length + 1).replaceAll("\\", "/");

// Frontmatter and description contract (lovable-skills/SKILL_METADATA.md).
const skill = await read("skills/jevify/SKILL.md");
const front = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);
if (!front) errors.push("SKILL.md frontmatter missing");
const name = front?.[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
const description = front?.[1].match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? "";
if (name !== "jevify") errors.push(`frontmatter name is "${name}", expected "jevify"`);
if (!description) errors.push("frontmatter description missing");
if ([...description].length > 300) errors.push(`description is ${[...description].length} characters (max 300)`);
if (!/\/jevify\b/.test(description)) errors.push("description must name the /jevify command");

// One version everywhere.
const v = (text, rx) => text.match(rx)?.[1];
const versions = {
  "SKILL.md identity": v(skill, /Version: `v(\d+\.\d+\.\d+)`/),
  "SKILL.md footer": v(skill, /Skill: \/jevify v(\d+\.\d+\.\d+)/),
  "SKILL.md report header": v(skill, /Skill: v(\d+\.\d+\.\d+)/),
  "VERSION.md": v(await read("VERSION.md"), /Current version: `v(\d+\.\d+\.\d+)`/),
  "report-template.md": v(await read("report-template.md"), /Skill: v(\d+\.\d+\.\d+)/),
  "CHANGELOG.md (latest)": v(await read("CHANGELOG.md"), /^## v(\d+\.\d+\.\d+)/m),
  "plugin.json": JSON.parse(await read(".claude-plugin/plugin.json")).version,
};
const market = JSON.parse(await read(".claude-plugin/marketplace.json"));
versions["marketplace.json"] = market.version;
for (const plugin of market.plugins ?? []) versions[`marketplace plugin ${plugin.name}`] = plugin.version;
if (new Set(Object.values(versions)).size !== 1) errors.push(`version mismatch: ${JSON.stringify(versions)}`);
const version = versions["VERSION.md"];

// Walk published files.
const all = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "reviews", ".agents"].includes(entry.name)) continue;
    if (dir === root && entry.name === "launch") continue;
    const p = resolve(dir, entry.name);
    entry.isDirectory() ? await walk(p) : all.push(p);
  }
}
await walk(root);

// Claims the project must not make.
const forbidden = [/Nothing leaves your machine/i, /nothing leaves the project/i, /does not connect to a JEV/i, /\bjev-\d/i, /\b\d+(\.\d+)?x (cheaper|faster)\b/i];
for (const p of all) {
  if (p === fileURLToPath(import.meta.url)) continue;
  const text = await readFile(p, "utf8").catch(() => null);
  if (text === null) continue;
  for (const rx of forbidden) if (rx.test(text)) errors.push(`forbidden phrase ${rx} in ${rel(p)}`);
}

// Relative links in Markdown resolve.
for (const p of all.filter((p) => extname(p).toLowerCase() === ".md")) {
  const text = await readFile(p, "utf8");
  for (const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const href = m[1].trim().replace(/^<|>$/g, "").split("#")[0];
    if (!href || /^(https?:|mailto:)/i.test(href)) continue;
    try { await stat(resolve(dirname(p), decodeURIComponent(href))); } catch { errors.push(`broken relative link in ${rel(p)}: ${m[1]}`); }
  }
}

// Every fixture has an expectation with a reason, and vice versa.
const fixtures = (await readdir(resolve(root, "evals", "fixtures"))).filter((x) => x.endsWith(".ts")).sort();
const expected = JSON.parse(await read("evals/expected.json"));
const keys = Object.keys(expected).sort();
if (JSON.stringify(fixtures) !== JSON.stringify(keys)) errors.push(`expected.json coverage mismatch: fixtures=${fixtures} expected=${keys}`);
for (const [file, e] of Object.entries(expected)) if (!e.class || !e.why) errors.push(`expected.json ${file} needs "class" and "why"`);

// When the catalog sits next to this repository, its mirror must be current.
const mirror = resolve(root, "..", "lovable-skills", "skills", "jevify");
let mirrorNote = "catalog mirror not found (skipped)";
try {
  await access(mirror);
  const hash = (t) => createHash("sha256").update(t).digest("hex");
  const mirrorSkill = await readFile(resolve(mirror, "SKILL.md"), "utf8");
  if (hash(mirrorSkill) !== hash(skill)) errors.push("catalog mirror SKILL.md differs; run node scripts/export-lovable.mjs");
  const mirrorVersion = v(await readFile(resolve(mirror, "VERSION.md"), "utf8"), /Current version: `v(\d+\.\d+\.\d+)`/);
  if (mirrorVersion !== version) errors.push(`catalog mirror VERSION is ${mirrorVersion}, expected ${version}`);
  mirrorNote = "catalog mirror matches";
} catch (e) { if (e.code !== "ENOENT") throw e; }

if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`check passed: v${version}, description ${[...description].length}/300, ${fixtures.length} fixtures, ${mirrorNote}`);
