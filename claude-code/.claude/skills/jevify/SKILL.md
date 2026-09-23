---
name: jevify
description: Run /jevify to audit a repository's runtime AI calls and flag structured decisions that are candidates for JEV (Choice/Score/Noul); writes jevify-report.md without modifying source. Run /jevify migrate <finding> to move one approved candidate to JEV, shadow mode first. Uses the jevify MCP server when connected and runs locally otherwise.
argument-hint: "[migrate <finding-id | file:line>]"
---

# jevify — /jevify and /jevify migrate

**Core principle:** Use LLMs for language. Use code for rules. Evaluate JEV for structured decisions.

| Command | What it does | Source changes |
|---|---|---|
| `/jevify` | Audits runtime AI call-sites and writes `jevify-report.md` | Never |
| `/jevify migrate <finding>` | Plans and applies the move of **one** candidate to JEV, shadow mode first | Only after the user approves the plan |

Plain requests work too: "jevify this repo" runs the audit; "migrate this call to JEV" runs
migrate. Treat latency, cost, and accuracy gains as hypotheses to validate, never as promises.

JEV is TypeSafe's decision model ([docs](https://docs.typesafe.ai)). It answers typed
questions about supplied state:

- **Choice** — one option from a closed set (up to 255), with probabilities and confidence.
- **Score** — a position on an ordered scale of 2–10 described levels.
- **Noul** — the probability that a condition holds; code applies a validated threshold.

Project: https://github.com/lucioamor/jevify · Service: https://jevify.lovable.app

---

## Mode: MCP or local

Pick the mode once per run and state it in the output.

**MCP mode** — the jevify MCP server is connected. Its tools are `audit_repository`,
`audit_files`, `classify_ai_callsite`, `generate_jevify_report`, and `migrate` when the server
offers it; clients may prefix the names (for example `mcp__jevify__audit_files`). The service
is the source of truth for classifications and migration plans. It stores reports privately
under the signed-in account and may send selected code to an AI provider.

**Local mode** — the server is not connected, the user declines to send code, or consent has
not been given. Follow the local method below. Nothing leaves the machine and no API key is
needed.

Rules for MCP mode:
- Before the first upload in a session, tell the user which files (count and paths) will be
  sent, and get a yes. For `audit_repository`, confirm the repository URL.
- Never send `.env*` files, credentials, private keys, or tokens. Replace secret values inline
  with `<redacted>` so line numbers stay stable.
- If the server is not connected, say once how to connect, then continue in local mode:
  `claude mcp add --transport http jevify https://jevify.lovable.app/mcp`, then sign in through
  `/mcp`. Other clients: add `https://jevify.lovable.app/mcp` as a remote MCP server with OAuth.
- If a tool fails, report the error and use local mode for that step. Never present local
  output as a service result.

---

## /jevify — audit (read-only)

### MCP mode

1. If the repository is public on GitHub and the user wants its pushed state audited, call
   `audit_repository`; it reads the remote, not local changes. Otherwise run local Step 1 to
   find files with call-sites and send them with `audit_files` (up to 80 files, 80,000
   characters each). If more files qualify, send runtime and server paths first and list the
   rest as not analyzed.
2. Write the returned Markdown to `jevify-report.md` (or the path the user gives), with a first
   line stating mode, audit id, and date.
3. Do not silently change the service's classifications. If you disagree, add a
   `Reviewer notes` section, labeled as your opinion, with the evidence.

### Local mode

**Step 1 — Find call-sites.** Search case-insensitively, among others, for:

```
SDKs and calls:  openai  anthropic  @google/genai  generativelanguage  generateContent
                 chat.completions  messages.create  responses.create  invokeModel  bedrock
                 generateText  generateObject  streamText  streamObject  (Vercel AI SDK)
                 ChatOpenAI  ChatAnthropic  .invoke(  withStructuredOutput  (LangChain)
                 litellm  openrouter  groq  together  mistral  cohere  ollama
Gateways:        /v1/chat/completions  ai.gateway.lovable.dev  LOVABLE_API_KEY
Existing JEV:    typesafe  systemone  jev-
```

Look in Supabase Edge Functions (`supabase/functions/**`), API routes (`app/api/**`,
`pages/api/**`, `routes/**`), server actions, workers and cron jobs, and other server files.
Skip dependencies, build output, tests, fixtures, and docs. An import, a config value, or a
model-name constant is not a call-site: find the call that sends the prompt, then read enough
context to see the prompt and how the response is consumed. List existing JEV usage separately.

Signals that a call is really a decision: structured output (`response_format`, `json_schema`,
`generateObject`, `withStructuredOutput`, `tool_choice`), an enum or `z.enum` output schema, a
small `max_tokens`, `temperature: 0`, or a response reduced to a label that feeds `if`,
`switch`, routing, or a stored status. Signals are evidence, not proof; confirm from how the
output is used.

**Step 2 — Classify each call-site.**

```
GENERATION_REQUIRED   → response used as original text/code. Leave it.
JEV_CANDIDATE         → response is a bounded decision (category / score / condition). Flag it.
DETERMINISTIC_CODE    → exact rules decide it. The AI call can go.
EMBEDDING_SEARCH      → similarity/retrieval. Use a vector index.
HUMAN_REVIEW          → high-risk decision. Gate it; don't automate it.
UNKNOWN               → the code can't settle it. List it for the user to confirm.
```

If the code uses only a label, field, score, or boolean from the response, it is a candidate.
If it renders, sends, stores as prose, or executes the text, it is generation. Split
**composites** ("classify AND draft a reply"): the classification part is a candidate; the
draft stays generation.

**Step 3 — Propose the primitive.**

```
choose one of N known options (≤255) → Choice
degree on an ordered scale           → Score
whether a condition holds            → Noul (probability + validated threshold in code)
```

Give each finding an id `path#line`. Record the **state** (minimal structured context the
decision needs), the **question**, and the **risk** (LOW/MEDIUM/HIGH) of a wrong answer.

**Step 4 — Write the report.** Write `jevify-report.md` at the repository root (or the path the
user gives):

1. **Header:** mode, date, and a summary line — N call-sites, X candidates, split by class.
2. **Inventory:** `finding | purpose | classification | primitive | risk | reason`.
3. **Per candidate:**
   ```
   finding:      path#line
   current:      what the LLM call does today (quote the prompt intent)
   recommended:  Choice/Score/Noul + state + question
   effect:       expected direction (lower latency / lower runtime cost), not a number
   architecture: JEV decision → confidence gate → current LLM path as fallback
   next step:    /jevify migrate path#line
   ```
4. **Retained generation:** listed briefly, so the user sees nothing was missed.
5. **Coverage:** what was searched, files read, anything skipped or unreadable.
6. **Footer:** link to the project repository; verify current JEV availability before
   production use; gains need validation in shadow mode before any claim.

Print the mode, the summary line, and the report path. Do not edit any source file.

---

## /jevify migrate <finding>

Migrate **one** call-site per run.

### 1. Select and re-check

- Accept a finding id (`path#line`) or `file:line`. With no argument, list the `JEV_CANDIDATE`
  findings from `jevify-report.md` and ask which one. With no report, classify that call-site
  first (local Step 2, or `classify_ai_callsite` in MCP mode).
- Re-read the current code. If it moved or changed since the report, classify it again.
- Stop and explain when it is not a candidate. `GENERATION_REQUIRED` stays as is. For a
  composite, migrate only the decision part. `DETERMINISTIC_CODE` is an ordinary refactor, not
  a JEV migration. `HUMAN_REVIEW` must not be automated. `UNKNOWN` needs the user's context.

### 2. Plan

In MCP mode, if the server offers `migrate`, call it with the finding (and the audit id when
known), following its input schema, and present its plan. If it does not, say so and plan
locally.

To plan locally, check the current TypeSafe docs first (start at
https://docs.typesafe.ai/llms.txt: API, models, and the chosen primitive). Do not rely on
memory for the endpoint, model id, limits, or SDK. The plan covers:

- **Current behavior:** prompt intent, model, and which response fields the code uses.
- **Request:** minimal named state with only the fields the decision needs; questions whose
  instructions point at state with backticked paths (`` `ticket.message` ``); criteria for
  every option or level; `other` and `insufficient_context` options for a Choice; concrete
  levels for a Score; explicit true/false criteria for a Noul. Dates, counts, and arithmetic are
  computed in code and enter state as facts.
- **Composition:** thresholds as named constants, marked as placeholders until tuned. Low Choice
  confidence, a mid-range Noul, `other`, or `insufficient_context` → current LLM path or human
  review. A service error or timeout is never a negative answer → current LLM path.
- **Placement:** server side only (Edge Function, API route, worker), in the project's existing
  stack or the official SDK. The key lives in the platform's secret store (`TYPESAFE_API_KEY`,
  or the name the SDK documents).
- **Boundary cases:** 3–5 inputs to check first, including one with injected instructions.
- **Validation:** what shadow logs capture, the agreement or quality metric, the sample size,
  the cutover criterion, and what makes the migration a no-go.
- **Risk:** a HIGH-risk decision stays in shadow mode in this run; cutover needs a human call.

Show the plan and wait for explicit approval before editing.

### 3. Implement in shadow mode

- Keep the current LLM call authoritative. Add the JEV decision beside it behind a flag with
  `off | shadow | on`, defaulting to `shadow`; `shadow` does nothing while the key is absent.
- The shadow call must not change the result, add blocking latency, or surface errors to the
  caller.
- Log per decision: finding id, LLM answer, JEV answer with its confidence or probability,
  agreement, and each latency. Do not log raw user content unless the app already does.
- Do not delete the LLM path. `on` uses JEV above the threshold and the LLM below it; `off` is
  the rollback.
- Never place the key in client code, logs, or commits, and never ask for its value in chat.
  Tell the user where to add it.
- Keep the diff minimal and in the existing style. Add or extend tests when the project has them.

### 4. Hand off

Report the files changed, the flag and its values, the secret name and where to add it, what
to watch in the shadow logs, and the cutover criterion. Append a line under
`## Migration log` in `jevify-report.md`: date, finding id, state reached (`shadow`), flag name.
Switching to `on` is a separate, explicit request once shadow data meets the criterion.

---

## Rules

- `/jevify` never modifies source; it writes only the report.
- `/jevify migrate` edits source only after plan approval, one call-site per run, shadow first.
- Direction of effect only — never a promised savings multiple.
- Never flag or migrate a generation task.
- If nothing qualifies, say so plainly — a clean audit is a valid result.
- Verify current JEV availability, pricing, and data terms before production adoption.
