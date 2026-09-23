# jevify in Claude Code

The jevify skill has two commands:

- `/jevify` audits runtime AI call-sites and identifies candidates for structured decisions with JEV. It writes a single report file (`jevify-report.md`) and never changes source code.
- `/jevify migrate <finding>` moves **one** approved candidate to JEV. It presents a plan, edits code only after you approve it, and starts in shadow mode.

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

Commit it to make the commands available to your team:

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

## Connect the jevify MCP server (optional)

With the server connected, the skill runs in **MCP mode**: the jevify service classifies call-sites, keeps your reports private under your account, and supplies migration plans. Without it, the skill runs in **local mode**: nothing leaves your machine and no account is needed.

```bash
claude mcp add --transport http jevify https://jevify.lovable.app/mcp
```

Then sign in through `/mcp` inside Claude Code. In MCP mode the skill asks before sending files, and never sends `.env` files or credentials. The service may send the code it receives to an AI provider for classification.

## Usage

From the repository root, inside Claude Code:

```text
/jevify
```

You can also ask: "jevify this repo."

The audit will:

1. Search for calls to OpenAI, Anthropic, Gemini, the Vercel AI SDK, LangChain, AI gateways, and other providers in Edge Functions, API routes, and server files.
2. Classify each call-site (`JEV_CANDIDATE`, `GENERATION_REQUIRED`, and other categories).
3. Propose Choice/Score/Noul, state, and risk for each candidate, with a finding id (`path#line`).
4. Write `jevify-report.md` at the repository root and print a summary.

Then migrate one candidate:

```text
/jevify migrate supabase/functions/triage/index.ts#42
```

The migration will:

1. Re-check that the call-site is still a candidate.
2. Present a plan: the JEV request, thresholds, fallback to the current LLM path, boundary cases, and a validation plan. It checks the current TypeSafe docs rather than relying on memory.
3. After your approval, add the JEV decision next to the existing call behind an `off | shadow | on` flag, defaulting to `shadow`. The LLM result stays authoritative in shadow mode.
4. Tell you which secret to add, what to watch in the shadow logs, and the cutover criterion, and log the migration in `jevify-report.md`.

Switching the flag to `on` is a separate decision, once shadow data meets the criterion.

## Notes

- `/jevify` never edits source code; it writes only the report.
- `/jevify migrate` changes one call-site per run, only after you approve the plan, and never removes the existing LLM path.
- Expected effects are hypotheses, without promised numbers. Validate quality, latency, cost, and fallback behavior in shadow mode.
- Keep `TYPESAFE_API_KEY` in your platform's secret store, never in client code or commits.
- Check current JEV availability, pricing, and data terms before production use.
