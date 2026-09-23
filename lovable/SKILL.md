---
name: jevify
description: Run /jevify for a read-only diagnosis of runtime AI calls in a Lovable project, flagging structured decisions that are candidates for JEV; the report comes back in chat. Run /jevify migrate <finding> to move one approved candidate to JEV, shadow mode first. Uses the jevify MCP connector when connected. Targets runtime AI cost, not build credits.
---

# jevify — /jevify and /jevify migrate for Lovable apps

## Skill identity

- Version: `v1.2.0`
- Source repo: `https://github.com/lucioamor/lovable-skill-jevify`
- Central catalog: `https://github.com/lucioamor/lovable-skills`
- Before the final response, compare the installed version with `VERSION.md` in the source repo when reachable.
- End with: `Skill: /jevify v1.2.0 · Version status: {current | update available | unverified} · Source: https://github.com/lucioamor/lovable-skill-jevify`.
- Use `current` only for a verified match, `update available` for a verified newer version, and `unverified` when the source cannot be checked.

## Commands

**Core principle:** Use LLMs for language. Use code for rules. Evaluate JEV for structured decisions.

| Command | What it does | Code changes |
|---|---|---|
| `/jevify` | Audits the app's runtime AI calls and returns a report in chat | Never |
| `/jevify migrate <finding>` | Plans and applies the move of **one** candidate to JEV, shadow mode first | Only after the user approves the plan |

Plain requests work too: "audit this app's AI calls" runs the audit; "migrate this call to
JEV" runs migrate. Treat latency, cost, and accuracy gains as hypotheses to validate, never as
promises.

JEV is TypeSafe's decision model ([docs](https://docs.typesafe.ai)). It answers typed
questions about supplied state:

- **Choice** — one option from a closed set (up to 255), with probabilities and confidence.
- **Score** — a position on an ordered scale of 2–10 described levels.
- **Noul** — the probability that a condition holds; code applies a validated threshold.

Project: https://github.com/lucioamor/jevify · Service: https://jevify.lovable.app

## Step 0 — Frame it right

If the user thinks this lowers the credits spent *building* the app (chatting with
Lovable): correct it in one line. `/jevify` targets the app's **runtime** AI cost — what
the deployed app spends per user action — not the build cost. Then continue.

---

## Mode: MCP or local

Pick the mode once per run and state it in the report.

**MCP mode** — the jevify connector is available in this chat. Its tools are
`audit_repository`, `audit_files`, `classify_ai_callsite`, `generate_jevify_report`, and
`migrate` when the server offers it. The service is the source of truth for classifications
and migration plans. It stores reports privately under the signed-in account and may send
selected code to an AI provider.

**Local mode** — the connector is not available, the user declines to send code, or consent
has not been given. Inspect the project yourself with the local method below. Nothing leaves
the project and no API key is needed.

Rules for MCP mode:
- Before the first upload in a chat, tell the user which files (count and paths) will be sent,
  and get a yes.
- Never send `.env*` files, credentials, or keys. Replace secret values inline with
  `<redacted>` so line numbers stay stable.
- If the connector is not available, say once how to add it, then continue in local mode:
  **Connectors → custom MCP server**, URL `https://jevify.lovable.app/mcp`, then sign in. It is
  a personal connector, so each user adds their own.
- If a tool fails, report the error and use local mode for that step. Never present local
  output as a service result.

---

## /jevify — audit (read-only)

**You never edit files in the audit.** You inventory, classify, and recommend.

### MCP mode

1. Run local Step 1 to find the files with AI calls, then send them with `audit_files` (up to
   80 files, 80,000 characters each). If the project syncs to a public GitHub repository and
   the user prefers it, `audit_repository` audits the pushed state instead.
2. Return the report in chat, with a first line stating mode, audit id, and date.
3. Do not silently change the service's classifications. If you disagree, add a
   `Reviewer notes` section, labeled as your opinion, with the evidence.

### Local mode

**Step 1 — Find the AI call-sites.** Look through the project for every runtime call to a
generative model: Edge Functions, API routes, anything hitting the Lovable AI gateway
(`ai.gateway.lovable.dev`, `LOVABLE_API_KEY`), OpenAI, Anthropic, Gemini, or another provider
(`generateText`, `generateObject`, `chat.completions`, `messages.create`). An import or a
model-name constant is not a call-site; find the call that sends the prompt. For each call,
note file, purpose, model, and how the output is used. List existing TypeSafe/JEV usage
separately.

Signals that a call is really a decision: JSON or structured output, a fixed list of allowed
values, a small `max_tokens`, `temperature: 0`, or a response reduced to a label that drives
an `if`, a route, or a stored status. Confirm from how the output is used.

**Step 2 — Classify each call-site.**

```
GENERATION_REQUIRED   → output is original text/code the app uses as text. Leave it.
JEV_CANDIDATE         → output is a bounded decision (category, score, condition). Flag it.
DETERMINISTIC_CODE    → exact rules decide it. It needs no AI at all.
EMBEDDING_SEARCH      → it's really similarity/retrieval. Use a vector index.
HUMAN_REVIEW          → high-risk decision. Should be gated, not blindly automated.
UNKNOWN               → can't tell from the code. Ask the user.
```

A call-site is a `JEV_CANDIDATE` when the prompt asks for a category from a fixed list, a
typed JSON field, a score on a scale, or a yes/no — and the app uses only that label, not free
text. It is `GENERATION_REQUIRED` when the response is shown to the user, emailed, turned into
code, or otherwise used as prose. Split composites ("classify AND draft a reply"): the
classification part is a candidate; the draft stays generation.

**Step 3 — For each candidate, propose the primitive.**

```
choose one of N known options (≤255) → Choice
degree on an ordered scale           → Score
whether a condition holds            → Noul (probability + validated threshold in code)
```

Give each finding an id `path#line`. Note the **risk** of a wrong answer (LOW / MEDIUM /
HIGH) — it decides how much autonomy the migrated version gets, not which engine.

**Step 4 — Report in chat.** Start with mode, date, and a summary line. Then a table, one row
per call-site:

| finding | purpose | classification | primitive | risk | why |
|---------|---------|----------------|-----------|------|-----|

Then, per `JEV_CANDIDATE`, a short block:
```
finding:      path#line
current:      what the LLM call does today
recommended:  Choice / Score / Noul + the state and question to model
effect:       expected direction (lower latency / lower runtime cost) — NOT a number
architecture: JEV decision → confidence gate → current LLM path as fallback
next step:    /jevify migrate path#line
```

---

## /jevify migrate <finding>

Migrate **one** call-site per run.

### 1. Select and re-check

- Accept a finding id (`path#line`) or a file and line. With no argument, list the
  `JEV_CANDIDATE` findings from the latest report in this chat and ask which one. With no
  report, classify that call-site first (local Step 2, or `classify_ai_callsite`).
- Re-read the current code. If it moved or changed since the report, classify it again.
- Stop and explain when it is not a candidate. Generation stays as is. For a composite,
  migrate only the decision part. `DETERMINISTIC_CODE` is an ordinary refactor, not a JEV
  migration. `HUMAN_REVIEW` must not be automated. `UNKNOWN` needs the user's context.

### 2. Plan

In MCP mode, if the server offers `migrate`, call it with the finding (and the audit id when
known), following its input schema, and present its plan. If it does not, say so and plan
locally.

To plan locally, check the current TypeSafe docs first (start at
https://docs.typesafe.ai/llms.txt: API, models, and the chosen primitive). Do not rely on
memory for the endpoint, model id, limits, or SDK. Explain the plan in plain language first,
then the details:

- **Current behavior:** what the AI call decides today and which part of the answer the app uses.
- **Request:** minimal named state with only the fields the decision needs; questions whose
  instructions point at state with backticked paths (`` `ticket.message` ``); criteria for
  every option or level; `other` and `insufficient_context` options for a Choice; concrete
  levels for a Score; explicit true/false criteria for a Noul. Dates, counts, and arithmetic are
  computed in code and enter state as facts.
- **Composition:** thresholds as named constants, marked as placeholders until tuned. Low Choice
  confidence, a mid-range Noul, `other`, or `insufficient_context` → current AI path or human
  review. A service error or timeout is never a negative answer → current AI path.
- **Placement:** an Edge Function, never the frontend. The key is a Lovable Cloud secret
  (`TYPESAFE_API_KEY`, or the name the SDK documents), never a `VITE_*` variable, which ships
  to the browser.
- **Boundary cases:** 3–5 inputs to check first, including one with injected instructions.
- **Validation:** what shadow logs capture, the agreement or quality metric, the sample size,
  the cutover criterion, and what makes the migration a no-go.
- **Risk:** a HIGH-risk decision stays in shadow mode in this run; cutover needs a human call.

Show the plan and wait for explicit approval before editing.

### 3. Implement in shadow mode

- Keep the current AI call authoritative. Add the JEV decision beside it behind a flag with
  `off | shadow | on`, defaulting to `shadow`; `shadow` does nothing while the secret is absent.
- The shadow call must not change the result, add blocking latency, or surface errors to users.
- Log per decision: finding id, current AI answer, JEV answer with its confidence or
  probability, agreement, and each latency. Do not log raw user content unless the app already
  does.
- Do not delete the current AI path. `on` uses JEV above the threshold and the current path
  below it; `off` is the rollback.
- Ask for the key through Lovable's secure secret prompt so the user enters it; never ask for
  its value in chat.
- Keep the change minimal and in the project's existing style.

### 4. Hand off

Report in chat: what changed, the flag and its values, the secret to add, what to watch in the
shadow logs, and the cutover criterion. Switching to `on` is a separate, explicit request once
shadow data meets the criterion.

---

## Rules

- `/jevify` never edits code. `/jevify migrate` edits only after plan approval, one call-site
  per run, shadow mode first.
- Never present a savings number as a promise — direction only, validated in shadow mode.
- Never flag or migrate a generation task. If you're reframing a writing task to fit
  Choice/Score/Noul, stop — it's `GENERATION_REQUIRED`.
- If nothing qualifies, say so plainly; a clean audit is a valid result.
- Verify current JEV availability, pricing, and data terms before production adoption.
- End by linking to the jevify project repository.
