---
name: jevify
description: Run /jevify to audit an app's runtime AI calls (repository or Lovable project) and flag structured decisions that fit JEV; the audit never edits source. Run /jevify migrate <finding> to move one approved candidate to JEV, shadow mode first.
---

# jevify — /jevify and /jevify migrate

**Principle:** use LLMs for language, code for rules, and evaluate JEV for bounded structured decisions. Treat latency, cost, and accuracy effects as hypotheses to measure; never promise a number.

## Skill identity

- Version: `v1.4.0`
- Canonical source: `https://github.com/lucioamor/jevify`
- Before the final response, compare this version with the canonical `VERSION.md` when reachable.
- End with: `Skill: /jevify v1.4.0 · Version status: {current | update available | unverified} · Source: https://github.com/lucioamor/jevify`. Use `current` or `update available` only after a successful check.

## Commands

| command | behavior | source changes |
|---|---|---|
| `/jevify` | Read-only audit of runtime AI call-sites; `--wide` also reports semantic code opportunities | never |
| `/jevify migrate <finding>` | Re-check, plan, get approval, migrate **one** candidate behind `off \| shadow \| on` | only after plan approval |

Plain requests work too: "audit this app's AI calls" runs the audit; "migrate this call to JEV" runs migrate. When installed as a Claude Code plugin the command may be namespaced (for example `/jevify:jevify`).

JEV is TypeSafe's decision model. It answers typed questions about supplied state: **Choice** (one option from a closed set), **Score** (a position on ordered, described levels), **Noul** (probability that a condition holds). Confirm current limits in the live docs.

## Environment

- **Lovable builder:** return the report in chat. Step 0: if the user expects lower build credits, correct it in one line — `/jevify` targets the deployed app's runtime AI usage, not the cost of building it. Secrets go in Lovable Cloud, never in frontend code or `VITE_*` variables.
- **Coding agent with file access:** write `jevify-report.md` at the repository root (or the requested path). The audit writes nothing else.
- **Privacy:** local mode sends no code to the jevify service. The agent itself may use remote model processing; say so plainly when asked, and do not claim that nothing leaves the machine.

## Mode: local or MCP

Pick the mode once per run and state it in the report header.

- **MCP mode** — the jevify service is connected (tools such as `audit_repository`, `audit_files`, `classify_ai_callsite`, `generate_jevify_report`, `migrate`; clients may prefix the names). Follow each tool's live schema and limits.
- **Local mode** — the service is not connected, the user declines to send code, or consent is pending.

If the service is not connected, say once how to connect, then continue locally:
- Claude Code: `claude mcp add --transport http jevify https://jevify.lovable.app/mcp`, then sign in through `/mcp` (or install the repository plugin).
- Lovable: **Connectors → custom MCP server** with `https://jevify.lovable.app/mcp`, then sign in.
- Other clients: add the URL as a remote HTTP MCP server with OAuth.

MCP rules:
- Before the first upload in a session, list the file count and paths and get a yes. For `audit_repository`, confirm the URL and say it reads the pushed remote, not local changes.
- Never send `.env*`, keys, tokens, credentials, or private keys. Replace secret values with `<redacted>` without shifting line numbers.
- **Service output is triage, not a verdict.** Its classifier sees a limited window around each call and may not see how the response is consumed. For every service result classified `JEV_CANDIDATE` or `DETERMINISTIC_CODE`, read the consumer yourself and set `verified` to `confirmed`, `disputed`, or `not checked`. Never rewrite the service classification; put disagreements with evidence under **Reviewer notes**.
- If a tool fails, report the error and do that step locally. Never present local output as a service result.

---

## `/jevify` — audit (read-only)

### 1. Find call-sites and read their consumers

Search case-insensitively, among others, for:

```
SDKs and calls:  openai  anthropic  @google/genai  generateContent  chat.completions
                 messages.create  responses.create  invokeModel  bedrock
                 generateText  generateObject  streamText  streamObject   (Vercel AI SDK)
                 ChatOpenAI  ChatAnthropic  .invoke(  withStructuredOutput  (LangChain)
                 litellm  openrouter  groq  together  mistral  cohere  ollama  embed(
Gateways:        /v1/chat/completions  /v1/responses  ai.gateway.lovable.dev  LOVABLE_API_KEY
Existing JEV:    typesafe  systemone  jev-
```

Look in Supabase Edge Functions (`supabase/functions/**`), API routes, server actions, workers, and cron jobs. Also follow thin wrappers (a local `ask()` or `llm()` helper that calls one of the above) to their call-sites. Skip dependencies, build output, tests, fixtures (unless auditing them on purpose), and docs.

An import, a model-name constant, a prompt string, a UI `label`, `schema.validate`, or `if (!res.ok)` is **not** a call-site. For each real call, read the prompt (including constants defined elsewhere), the response parsing, and the downstream consumer. List existing JEV usage separately.

Decision signals (evidence, not proof — confirm from the consumer): structured output (`response_format`, `json_schema`, `generateObject`, `withStructuredOutput`, `tool_choice`), an enum output schema, small `max_tokens`, `temperature: 0`, or a response reduced to a label that feeds `if`, `switch`, routing, or a stored status.

### 2. Classify

```
GENERATION_REQUIRED  response is used as prose, code, or other generated content → keep
JEV_CANDIDATE        consumer uses only a category, ordered score, or condition → flag
DETERMINISTIC_CODE   exact rules settle it; the model call is unnecessary → ordinary refactor
EMBEDDING_SEARCH     vector similarity performs retrieval → keep retrieval in the index
HUMAN_REVIEW         the decision requires human authority → gate it, never automate it
UNKNOWN              evidence is insufficient → list it for the user to confirm
```

- If the consumer renders, sends, stores as prose, or executes the text, it is generation. Words in the prompt ("announcement", "label") never decide the class; the consumer does.
- Exception: if every character of the output must come from the input and the model only decides *which* span, part, or structure (a phone number found in the text, a date's parts, headings in a flattened document), it is a candidate — code finds or renders the text, JEV picks. If the value must be written, summarized, or inferred, it stays generation.
- An existing LLM call that judges, moderates, checks citations, or validates another model's output is itself a decision call; classify it like any other.
- Split **composites** ("classify AND draft a reply"): the decision part is a candidate; the draft stays generation.
- After retrieval, a relevance re-rank or passage filter may separately be a candidate (Noul or Score per item).
- Risk (`LOW`, `MEDIUM`, `HIGH`) records the cost of a wrong answer and is independent of the class. Money, access, destructive actions, and safety decisions are at least `HIGH`.
- Give each finding the id `path#line`.

### 3. Primitive, pattern, and cookbook

Only after classification, record four separate fields per candidate. They are different kinds of thing; do not collapse them.

- **Primitive** — the question type:
  - one of N known options → **Choice**, with `other` and `insufficient_context` options (probabilities sum to 1, so some option always wins; when "no option fits" is itself likely, also ask a Noul such as "an answer exists")
  - degree on an ordered scale → **Score**, with concrete, self-standing level descriptions; when a middle outcome is a real action (send to review), give it its own level instead of tuning a threshold
  - whether a condition holds → **Noul**, with explicit true/false criteria
- **Pattern** — TypeSafe's architectural patterns (`https://docs.typesafe.ai/patterns.md`): **Intent routing**, **Confidence-gated routing**, **Composite scoring**, **Speculative fan-out**; more than one may apply, or `—`.
- **Cookbook** — the closest official recipe (primary, plus a companion when one adds a missing piece), chosen with the table below (slug → `https://docs.typesafe.ai/cookbooks/<slug>.md`) and confirmed in `https://docs.typesafe.ai/llms.txt` at audit time; a cookbook added there later may fit better than any row. If the docs are unreachable, keep the slug and mark it `unverified`. No row fits → `cookbook: none`; never force a match.
- **Fit** — one line on why it matches and what the app must adapt (different state, fewer options, other risk).

| signal in the code and consumer | primitive | pattern | cookbook |
|---|---|---|---|
| a label picks a queue, handler, or branch | Choice | Intent routing | `classification_using_confidence` |
| `tool_choice` or intent → function with closed-set arguments | Choice per name and argument; Noul "was it stated" | Intent routing | `function_calling` |
| picking from a large catalog (skills, products, templates) | Choice to rank, Nouls to re-check the top few | Intent routing | `skill_suggestion` |
| deep taxonomy, or more options than one Choice allows | Choice per level | Intent routing | `hierarchical_classification` |
| ordering a retrieved shortlist | Noul (or Score) per item, sorted in code | — | `rerank_typesafe` |
| filtering retrieved passages before generation | Noul battery per passage | Composite scoring | `classifying_rag_passages` |
| "where in this document is the answer / is there one" | Choice over line ids + Noul | — | `semantic_find` |
| "are these two records the same" (dedupe, merge) | Score + Noul per field | Confidence-gated routing | `entity_alignment` |
| several decisions about the same record | mixed, one request | Speculative fan-out | `parallel_questions` |
| weighted multi-factor score (lead, priority, fit) | Score/Noul battery, combined in code | Composite scoring | — |
| moderation or safety screen on model input or output | Noul battery + Score severity | Confidence-gated routing | `llm_guardrails` |
| a judge checks whether a citation supports a claim | Choice (supports, contradicts, silent) | — | `citation_check` |
| a judge checks extracted fields, then retries with a bigger model | Noul per field | Confidence-gated routing | `sde_cascade` |
| a value that appears verbatim in the text (email, phone, amount, id) | Choice among code-found spans | — | `pre_parsed_value_extraction_cookbook` |
| a date stated absolutely or relatively | Choice per date part; code resolves | — | `date_extraction_cookbook` |
| structure of text that must keep its words (headings, joins, segments) | Noul/Choice per line or block; code renders | — | `autoformat` |
| a wrong answer is costly and the model must be able to abstain | as above | Confidence-gated routing | companion: `consistency_noul_cookbook` or `consistency_choice_cookbook` |

`autoresearch_feature_discovery` applies only when the app trains its own model on text features; mention it under **Opportunities**, never as a migration. Cookbook results (accuracy, cost, speed multiples) are TypeSafe's measurements on its data: cite the recipe, never its numbers, as the expected effect.

Recommend TypeSafe's official agent skill (linked from `llms.txt`) for detailed question design; jevify owns discovery and safe migration.

Decision policy:
- Picking the best option uses the highest Choice probability; no universal cutoff.
- Triggering an action uses a threshold calibrated to the cost of error, on the user's data. Gate on the answer's reported confidence (how concentrated the probabilities are), not only on the winner's probability.
- A low-confidence answer can fall back to a coarser answer (the parent category), the current path, or human review — choose by cost of error.
- A Noul near `0.5` is a tie, not medium intensity.
- The model reads; code computes. Dates, arithmetic, normalization, and copying values stay in code.
- Confidence describes certainty; it is never permission to act. See `https://docs.typesafe.ai/confidence.md`.

### 4. Consolidation and wide opportunities

- **Consolidation:** when several model calls decide things about the same ticket, lead, document, or record, propose one JEV request with parallel questions over shared state. Report under **Consolidation**, separate from candidates.
- **`--wide` only:** report under **Opportunities** with evidence, risk, and the closest cookbook; never as call-sites or candidates:
  - regexes, keyword chains, and intent parsers doing semantic work (a regex that over-finds candidates can feed a JEV pick);
  - decision points around retained generation where nothing checks today: screening model input or output, checking citations, verifying extracted fields before use.

### 5. Report

Write (or return in chat) this structure:

1. **Header:** `Mode: local|MCP · Date · Audit id (MCP only) · Skill: v1.4.0`, then one summary line: N call-sites, X candidates, split by class.
2. **Inventory:** `finding | purpose | classification | primitive | risk | verified | evidence`.
3. **Candidate details**, one block each: `current` (what the call decides and how the consumer uses it), `recommended` (primitive + minimal state + question), `pattern`, `cookbook` (primary; companion if any), `fit`, `effect` (direction only), `architecture` (shadow comparison → calibrated action policy → current path as fallback), `next step: /jevify migrate path#line`.
4. **Retained generation**, briefly, so nothing looks missed.
5. **Consolidation** and, with `--wide`, **Opportunities**.
6. **Reviewer notes** (MCP mode).
7. **Coverage:** what was searched, files read, skipped or unreadable files, known blind spots (dynamic calls, generated code).
8. **Migration log** (empty until a migration runs) and a footer: project link; verify JEV availability, pricing, and data terms before production; effects are hypotheses until measured in shadow mode.

If nothing qualifies, say so plainly — a clean audit is a valid result. Print the mode, the summary line, and where the report is.

---

## `/jevify migrate <finding>`

One call-site per run.

### 1. Select and re-check

- Accept `path#line` or `file:line`. With no argument, list the report's `JEV_CANDIDATE` findings and ask. With no report, classify that call-site first (locally, or `classify_ai_callsite` in MCP mode).
- Re-read the current code and its consumer; reclassify if it changed.
- Stop and explain for `GENERATION_REQUIRED`, `DETERMINISTIC_CODE` (ordinary refactor), `HUMAN_REVIEW`, and `UNKNOWN`. For a composite, migrate only the decision part.

### 2. Plan

In MCP mode, if the service offers `migrate`, call it and present its plan; annotate disagreements instead of rewriting it. Otherwise plan locally, starting from `https://docs.typesafe.ai/llms.txt` (API, SDK, models, known issues for the current model, chosen primitive, pattern, and the finding's cookbook). Read the cookbook before writing questions and reuse its structure; adapt state and criteria to this app. Never rely on remembered endpoints, field names, limits, or model ids.

The plan covers:
- **Current behavior:** prompt intent, model, and which response fields the code uses.
- **Request:** minimal named state; questions that point at state with backticked paths; criteria for every option, level, or true/false outcome. Dates, counts, and arithmetic are computed in code and enter state as facts. If other calls decide about the same state, say whether to consolidate.
- **Composition:** thresholds as named constants in one place, marked as placeholders until tuned; `other`, `insufficient_context`, low confidence, or a Noul near the threshold → a coarser answer, the current path, or human review. A service error or timeout is never a negative answer → current path. Code finds candidates before and normalizes values after; JEV never re-types a value.
- **Placement:** server side only, in the project's stack or the official SDK. Key in the platform's secret store under the name the docs use.
- **Boundary cases:** 3–5 inputs, including one with injected instructions.
- **Shadow validation** (below) and **rollback**.
- **Risk:** HIGH-risk decisions stay in shadow in this run; cutover needs a separate human decision.

Show the plan and wait for explicit approval before editing.

### 3. Implement in shadow mode

- Keep the current path authoritative. Add the JEV decision beside it behind a flag `off | shadow | on`, default `shadow`; `shadow` is a no-op while the key is absent.
- Shadow must not change the result, add blocking latency (run it after or alongside the authoritative path without awaiting it on the response path), or surface its errors.
- `on` uses JEV when the action policy is met and the current path otherwise; `off` is the rollback. Do not delete the current path.
- Never put the key in client code, logs, or commits, and never ask for its value in chat; tell the user where to add it.
- Keep the diff minimal and in the existing style; add or extend tests when the project has them.

### 4. Shadow validation

Fix the cutover criterion **before** collecting data. Agreement with the current model does not prove correctness: label a sample of disagreements against a human-approved reference. The current model is not self-consistent either (even at temperature 0): re-run it a few times on a small sample to measure how often it disagrees with itself, and do not count that noise as JEV error. Log per decision, without raw sensitive content unless the app already logs it:

- finding id, current answer, JEV answer with probability or confidence, labeled outcome when available;
- cost per decision on both paths and the incremental cost of shadow;
- fallback rate; latency p50/p95 on both paths; errors.

### 5. Hand off

Report the files changed, the flag name and values, the secret name and where to add it, what to watch in the shadow logs, the cutover criterion, and the no-go conditions. Append to `## Migration log`: `| date | finding | shadow | flag name |`. Switching to `on` is a separate, explicit request once shadow data meets the criterion.

---

## Rules

- `/jevify` never modifies source; it writes only the report.
- `/jevify migrate` edits source only after plan approval, one call-site per run, shadow first.
- Never turn generation into a decision to manufacture a candidate; never rewrite service classifications.
- Direction of effect only — never a promised savings multiple. Local validation does not prove production behavior.
- Verify current availability, pricing, data handling, SDK, API fields, and model names before production use.
- Keep attribution to Lucio Amorim and the CC BY 4.0 license when redistributing.
