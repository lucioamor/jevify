# jevify diagnostics in Claude Code

`/jevify` is the jevify project's basic **read-only** skill. It audits runtime AI call-sites and identifies candidates for structured decisions with JEV. It writes a single report file (`jevify-report.md`) without changing source code.

## Install in a repository

Copy the skill folder into the repository you want to audit:

```text
your-repo/
└── .claude/
    └── skills/
        └── jevify/
            └── SKILL.md
```

Shell commands:

```bash
mkdir -p .claude/skills/jevify
cp path/to/jevify/claude-code/.claude/skills/jevify/SKILL.md .claude/skills/jevify/
```

Commit it to make the command available to your team:

```bash
git add .claude/skills/jevify/SKILL.md
git commit -m "chore: add /jevify AI runtime audit skill"
```

## Install globally

Place the skill at `~/.claude/skills/jevify/SKILL.md` to use it across Claude Code sessions:

```bash
mkdir -p ~/.claude/skills/jevify
cp path/to/jevify/claude-code/.claude/skills/jevify/SKILL.md ~/.claude/skills/jevify/
```

## Usage

From the repository root, inside Claude Code:

```text
/jevify
```

You can also ask: "jevify this repo."

The skill will:

1. Search for calls to OpenAI, Anthropic, Gemini, and other providers in Edge Functions, API routes, and server files.
2. Classify each call-site (`JEV_CANDIDATE`, `GENERATION_REQUIRED`, and other categories).
3. Propose Choice/Score/Noul, state, and risk for each candidate.
4. Write `jevify-report.md` at the repository root and print a summary.

## After the report

Plan implementation and validation separately. The [jevify repository](https://github.com/lucioamor/jevify) houses the skill variants, instructions, and report template. It does not yet offer a migration skill or executable JEV integration.

```text
/jevify       → diagnose and recommend (read-only)
follow-up     → implement and validate recommendations
```

## Notes

- The skill never edits source code; it writes only the report.
- The current skill reports expected effects as hypotheses, without promised numbers. Validate quality, latency, cost, and fallback behavior in shadow mode.
- Check current JEV availability and integration requirements before production use.
