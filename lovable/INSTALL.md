# jevify in Lovable

The jevify skill has two commands:

- `/jevify` audits a Lovable project and identifies runtime generative LLM calls that may be candidates for structured decisions with JEV. It returns a report in chat and never changes the app.
- `/jevify migrate <finding>` moves **one** approved candidate to JEV. It presents a plan, edits the app only after you approve it, and starts in shadow mode.

## Install in a Lovable workspace

Import the public repository through **Settings → Skills → Add → Import from GitHub**:

```text
https://github.com/lucioamor/lovable-skill-jevify
```

Use this standalone repository, which contains `SKILL.md` at the root. You can also upload the project's `lovable/SKILL.md` through the workspace skill settings. Preserve the frontmatter, including `name: jevify` and `description`.

Once installed, the skill is available across the workspace through `/jevify`. Re-import the repository when a new version is published.

## Connect the jevify MCP server (optional)

With the connector added, the skill runs in **MCP mode**: the jevify service classifies call-sites, keeps your reports private under your account, and supplies migration plans. Without it, the skill runs in **local mode**: the Lovable agent inspects the project itself and nothing is sent to the jevify service.

Open **Connectors**, add a custom MCP server with this URL, and sign in:

```text
https://jevify.lovable.app/mcp
```

Custom MCP servers are personal connectors, so each person adds their own. In MCP mode the skill asks before sending files and never sends `.env` files or credentials. The service may send the code it receives to an AI provider for classification.

## Usage

In a project's builder chat:

```text
/jevify
```

You can also ask: "Audit this app's runtime AI calls."

The audit will:

1. Locate runtime AI calls, including Edge Functions and Lovable AI gateway calls.
2. Classify each call-site as a JEV candidate, generation, deterministic code, retrieval, human review, or unknown.
3. Propose Choice/Score/Noul, the required state, and risk for each candidate, with a finding id (`path#line`).
4. Return the report in chat.

Then migrate one candidate:

```text
/jevify migrate supabase/functions/triage/index.ts#42
```

The migration will:

1. Re-check that the call-site is still a candidate.
2. Explain the plan in plain language, then the details: the JEV request, thresholds, fallback to the current AI path, boundary cases, and a validation plan.
3. After your approval, add the JEV decision in an Edge Function next to the existing call, behind an `off | shadow | on` flag that defaults to `shadow`. The current AI result stays authoritative in shadow mode.
4. Ask you to add the API key through Lovable's secure secret prompt, and tell you what to watch in the shadow logs and when to switch.

Switching the flag to `on` is a separate decision, once shadow data meets the criterion.

## Scope

- Targets the published app's **runtime** AI usage, not **build** credits.
- `/jevify` audits and recommends without changing the app.
- `/jevify migrate` changes one call-site per run, only after you approve the plan, and never removes the existing AI path.

## Notes

- The audit requires no JEV API key. A migration keeps the key in a Lovable Cloud secret, never in the frontend or a `VITE_*` variable.
- Expected effects are hypotheses, without promised numbers. Validate them in shadow mode.
- Check current JEV availability, pricing, and data terms before production use.
