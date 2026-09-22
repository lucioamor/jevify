# jevify

> **Runtime AI diagnostics to identify opportunities with JEV.** The **jevify diagnostics** skill identifies where an app uses generation for a structured decision and proposes candidates to evaluate with JEV (Choice/Score/Noul). It produces a report without changing source code.
>
> **jevify** is the project. **jevify diagnostics** is its basic read-only skill.

## Project and skill

| Component | What it is | Where to find it |
|---|---|---|
| **Project / repository — jevify** | The diagnostic project and its public home for skills, documentation, and examples. The application's implementation is maintained separately. | [Public repository](https://github.com/lucioamor/jevify) · [Site](https://jevify.lovable.app) |
| **Skill — jevify diagnostics** | Reusable instructions that an agent follows to inspect runtime AI calls, classify them, and recommend candidates for evaluation. It produces a report without changing source code. | Skill files and installation options below |

JEV is the technology evaluated in recommendations; jevify organizes the diagnosis. The skill works independently and requires no JEV API access to inspect code. Implementation and validation are separate follow-ups. This repository does not yet provide a migration skill, executable JEV integration, or usage statistics.

A live site and MCP server are available at **[jevify.lovable.app](https://jevify.lovable.app)**.

## Choose your environment

The diagnostic method is independent of a particular AI client. Use the skill in an environment that can load its instructions and inspect the source being audited. Skill discovery, invocation, file access, and MCP connections depend on the client; support for MCP alone does not establish support for installing a skill.

| Variant | Runs in | Inspects | Output |
|---|---|---|---|
| **Lovable** (`lovable/SKILL.md`) | The Lovable builder | Runtime AI calls in the accessible project, including Edge Functions and AI gateway calls | Report in chat |
| **Repository audit** (`claude-code/.claude/skills/jevify/SKILL.md`) | A coding agent with access to the repository and support for `SKILL.md` instructions | Available source files, searching for LLM SDKs and call-sites | `jevify-report.md` |

The repository-audit file is currently stored under `claude-code/`. Install it using your client's supported skill location and invocation syntax. Compatibility has not been tested across every client.

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

- **Coding agents:** use the [repository-audit skill](claude-code/.claude/skills/jevify/SKILL.md). Install the skill folder in the location supported by your client, then invoke it using that client's skill interface. The existing [installation guide](claude-code/INSTALL.md) covers Claude Code; other clients require their own setup.
- **Lovable:** import [lovable-skill-jevify](https://github.com/lucioamor/lovable-skill-jevify) as a workspace skill. Run `/jevify` inside a project. See [installation instructions](lovable/INSTALL.md).

## Publishing and maintenance

- Public project repository: [lucioamor/jevify](https://github.com/lucioamor/jevify).
- Canonical Lovable skill: [lovable-skills/skills/jevify](https://github.com/lucioamor/lovable-skills/tree/main/skills/jevify).
- Import package: [lucioamor/lovable-skill-jevify](https://github.com/lucioamor/lovable-skill-jevify), with `SKILL.md` at the root.

The repository-audit skill and report template are maintained here. The Lovable variant currently comes from the catalog, whose sync workflow publishes the standalone import package. Re-import the package to update an installed Lovable skill.

## Principle

**Use LLMs for language. Use code for rules. Evaluate JEV for structured decisions.**

## Diagnostic boundaries

- Never edits source code; the repository-audit variant writes only the report.
- The current skill reports effects as hypotheses, without promised numerical gains. Validate quality, latency, cost, and fallback behavior before claiming improvements.
- Targets runtime AI usage, not Lovable build credits.
- Check current JEV availability and integration requirements before planning production use.

## Authorship and maintenance

This project was created by [Lucio Amorim](https://linkedin.com/in/lucioamorim), Lovable Ambassador.

When reusing, redistributing, or citing this work, keep the attribution credits and include a link to this repository.

## License

The skills, instructions, and report template are licensed under [Creative Commons Attribution 4.0 International](./LICENSE) (`CC BY 4.0`).
