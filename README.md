# jevify

> **Find the AI calls in your app that are really decisions, then move them to JEV safely.** The **jevify** skill has two commands: `/jevify` audits runtime AI calls and proposes candidates for JEV (Choice/Score/Noul) without changing source code; `/jevify migrate` moves one approved candidate to JEV, starting in shadow mode.
>
> **jevify** is the project. The **jevify skill** is how an agent uses it; the **jevify MCP server** is where the method runs when connected.

## Project, skill, and service

| Component | What it is | Where to find it |
|---|---|---|
| **Project / repository — jevify** | The public home for the skill, documentation, and report format. | [Public repository](https://github.com/lucioamor/jevify) · [Site](https://jevify.lovable.app) |
| **Skill — jevify** | Instructions an agent follows: `/jevify` to audit, `/jevify migrate <finding>` to migrate one candidate. It uses the MCP server when connected and runs locally otherwise. | Skill files and installation options below |
| **Service — jevify MCP** | A hosted application at [jevify.lovable.app](https://jevify.lovable.app) whose MCP server, REST API, and console classify call-sites and keep reports private under your account. Its implementation is maintained separately. | `https://jevify.lovable.app/mcp` (OAuth) |

JEV is TypeSafe's decision model ([docs](https://docs.typesafe.ai)); jevify organizes the diagnosis and the migration. Auditing requires no JEV API access. A migration needs a TypeSafe API key, kept server-side.

## Two modes

| | MCP mode | Local mode |
|---|---|---|
| **When** | The jevify MCP server is connected and you agree to send the relevant files | No connection, private code you don't want to send, or no consent yet |
| **Audit** | The service classifies call-sites and returns a report stored privately under your account | The agent follows the method in the skill; nothing leaves your machine or project |
| **Migration plan** | Comes from the service's `migrate` tool | The agent drafts it from the current TypeSafe docs |
| **Code changes** | Applied by your agent, after you approve the plan | Same |

The skill asks before sending files and never sends `.env` files or credentials. In MCP mode the service may send the code it receives to an AI provider for classification. The service does not edit your code, connect to a JEV product API, or publish usage/impact statistics.

The `migrate` MCP tool is planned. Until the server offers it, `/jevify migrate` plans locally in both modes.

## Choose your environment

The method is independent of a particular AI client. Use the skill in an environment that can load its instructions and inspect the source being audited. Skill discovery, invocation, file access, and MCP connections depend on the client; support for MCP alone does not establish support for installing a skill.

| Variant | Runs in | Inspects | Output |
|---|---|---|---|
| **Lovable** (`lovable/SKILL.md`) | The Lovable builder | Runtime AI calls in the accessible project, including Edge Functions and AI gateway calls | Report and migration plan in chat |
| **Repository** (`claude-code/.claude/skills/jevify/SKILL.md`) | A coding agent with access to the repository and support for `SKILL.md` instructions | Available source files, searching for LLM SDKs and call-sites | `jevify-report.md`, including a migration log |

The repository file is currently stored under `claude-code/`. Install it using your client's supported skill location and invocation syntax. Compatibility has not been tested across every client.

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

- **Coding agents:** install the [repository skill](claude-code/.claude/skills/jevify/SKILL.md) in the location your client supports. Optionally connect the MCP server; in Claude Code: `claude mcp add --transport http jevify https://jevify.lovable.app/mcp`. Run `/jevify`, then `/jevify migrate <finding>`. See the [installation guide](claude-code/INSTALL.md).
- **Lovable:** import [lovable-skill-jevify](https://github.com/lucioamor/lovable-skill-jevify) as a workspace skill. Optionally add `https://jevify.lovable.app/mcp` under **Connectors** as a custom MCP server. Run `/jevify` inside a project. See [installation instructions](lovable/INSTALL.md).

## Publishing and maintenance

- Public project repository: [lucioamor/jevify](https://github.com/lucioamor/jevify).
- Canonical Lovable skill: [lovable-skills/skills/jevify](https://github.com/lucioamor/lovable-skills/tree/main/skills/jevify).
- Import package: [lucioamor/lovable-skill-jevify](https://github.com/lucioamor/lovable-skill-jevify), with `SKILL.md` at the root.

The repository skill and report template are maintained here. The Lovable variant currently comes from the catalog, whose sync workflow publishes the standalone import package. Re-import the package to update an installed Lovable skill.

## Principle

**Use LLMs for language. Use code for rules. Evaluate JEV for structured decisions.**

## Boundaries

- `/jevify` never edits source code; the repository variant writes only the report.
- `/jevify migrate` changes one call-site per run, only after you approve the plan. It adds the JEV decision next to the existing call behind an `off | shadow | on` flag, starts in shadow mode, and never removes the existing AI path.
- Effects are reported as hypotheses, without promised numerical gains. Validate quality, latency, cost, and fallback behavior in shadow mode before claiming improvements.
- Targets runtime AI usage, not Lovable build credits.
- Check current JEV availability, pricing, and data terms before production use.

## Authorship and maintenance

This project was created by [Lucio Amorim](https://linkedin.com/in/lucioamorim), Lovable Ambassador.

When reusing, redistributing, or citing this work, keep the attribution credits and include a link to this repository.

## License

The skills, instructions, and report template are licensed under [Creative Commons Attribution 4.0 International](./LICENSE) (`CC BY 4.0`).
