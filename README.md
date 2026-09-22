# jevify

> **Runtime AI diagnostics to identify opportunities with JEV.** The `/jevify` skill identifies where an app uses generation for a structured decision and proposes candidates to evaluate with JEV (Choice/Score/Noul). It produces a report without changing source code.
>
> **jevify** is the project. **`/jevify`** is its basic read-only diagnostic skill.

## Project and skill

| Component | Role | Available today |
|---|---|---|
| **jevify** ([project repository](https://github.com/lucioamor/jevify)) | Houses the project and supporting material | Lovable and Claude Code variants, installation instructions, and report template |
| **jevify diagnostics** (`/jevify`) | Inventories, classifies, and recommends | Read-only audit; the Claude Code variant writes only the report |

JEV is the technology evaluated in recommendations; jevify organizes the diagnosis. The skill works independently and requires no JEV API access to inspect code. Implementation and validation are separate follow-ups. This repository does not yet provide a migration skill, executable JEV integration, or usage statistics.

A live site and MCP server are available at **[jevify.lovable.app](https://jevify.lovable.app)**.

## Two variants, shared purpose

| Variant | Runs in | Inspects | Output |
|---|---|---|---|
| **Lovable** (`lovable/SKILL.md`) | The Lovable builder | Runtime AI calls in the accessible project, including Edge Functions and AI gateway calls | Report in chat |
| **Claude Code** (`claude-code/.claude/skills/jevify/SKILL.md`) | A terminal against a repository | Available source files, searching for LLM SDKs and call-sites | `jevify-report.md` |

## Structure

```text
jevify/
├── README.md
├── report-template.md
├── lovable/
│   ├── SKILL.md
│   └── INSTALL.md
└── claude-code/
    ├── INSTALL.md
    └── .claude/skills/jevify/SKILL.md
```

## Quick start

- **Claude Code:** copy `claude-code/.claude/skills/jevify/` to your repository's `.claude/skills/`, or to `~/.claude/skills/` for global use. Run `/jevify`. See [installation instructions](claude-code/INSTALL.md).
- **Lovable:** import [lovable-skill-jevify](https://github.com/lucioamor/lovable-skill-jevify) as a workspace skill. Run `/jevify` inside a project. See [installation instructions](lovable/INSTALL.md).

## Publishing and maintenance

- Full project: [lucioamor/jevify](https://github.com/lucioamor/jevify).
- Canonical Lovable skill: [lovable-skills/skills/jevify](https://github.com/lucioamor/lovable-skills/tree/main/skills/jevify).
- Import package: [lucioamor/lovable-skill-jevify](https://github.com/lucioamor/lovable-skill-jevify), with `SKILL.md` at the root.

Edit the Lovable variant in the catalog and keep this project's `lovable/SKILL.md` synchronized. The Claude Code variant and report template are maintained here. The catalog's sync workflow publishes the standalone import package; importing users must re-import to update their installed skill.

Always write **jevify** in lowercase. Keep public repository documentation and GitHub descriptions in English.

## Principle

**Use LLMs for language. Use code for rules. Evaluate JEV for structured decisions.**

## Diagnostic boundaries

- Never edits source code; the Claude Code variant writes only the report.
- The current skill reports effects as hypotheses, without promised numerical gains. Validate quality, latency, cost, and fallback behavior before claiming improvements.
- Targets runtime AI usage, not Lovable build credits.
- Check current JEV availability and integration requirements before planning production use.

## Authorship and maintenance

This project was created by [Lucio Amorim](https://linkedin.com/in/lucioamorim), Lovable Ambassador.

When reusing, redistributing, or citing this work, keep the attribution credits and include a link to this repository.

## License

The skills, instructions, and report template are licensed under [Creative Commons Attribution 4.0 International](./LICENSE) (`CC BY 4.0`).
