---
name: jevify
description: Audit runtime AI calls in a repository or Lovable project, verify structured-decision candidates, and migrate one approved finding to JEV in shadow mode. Reports in chat or jevify-report.md; audit never edits source.
---

# jevify

Use LLMs for language, code for rules, and evaluate JEV for narrow structured decisions. Treat effects as hypotheses; never promise numerical gains.

## Skill identity

- Version: `v1.3.0`
- Canonical source: `https://github.com/lucioamor/jevify`
- Before the final response, compare this version with the canonical `VERSION.md` when reachable.
- End with: `Skill: /jevify v1.3.0 · Version status: {current | update available | unverified} · Source: https://github.com/lucioamor/jevify`.

## Environment

- In the Lovable builder, return the report in chat. Step 0: distinguish build credits from the deployed app's runtime AI usage. Put the TypeSafe API key in a Lovable Cloud secret, never a frontend or `VITE_*` variable.
- In a coding agent with file access, write `jevify-report.md` at the repository root or the requested path. The audit changes no source.
- Local mode does not send code to the jevify service. The agent may itself use remote processing; describe that separately and precisely.

## Commands

| command | behavior |
|---|---|
| `/jevify` | Read-only audit of runtime AI call-sites. Add `--wide` to find semantic deterministic code as opportunities. |
| `/jevify migrate <finding>` | Re-check, plan, request approval, then migrate one approved candidate behind `off | shadow | on`. |

## Connect the optional jevify service

- Claude Code: `claude mcp add --transport http jevify https://jevify.lovable.app/mcp`, then authenticate through `/mcp`, or install the repository plugin.
- Lovable: **Connectors → custom MCP server**, add `https://jevify.lovable.app/mcp`, then sign in.
- Generic client: add that URL as a remote HTTP MCP server with OAuth when supported.

Before uploading, list the exact file count and paths and obtain consent. Never upload `.env*`, keys, tokens, credentials, or private keys. Redact secret values without shifting line numbers.

## Mode contract

**Local:** inspect files directly and produce the report. **MCP:** the jevify service tools provide triage, not a verdict. The service classifier sees a narrow window around a call and may not see how the response is consumed. For every service result classified `JEV_CANDIDATE` or `DETERMINISTIC_CODE`, read the consumer and set `verified` to `confirmed`, `disputed`, or `not checked`. Preserve the service result; put disagreements and evidence in **Reviewer notes**.

The service may offer `audit_repository`, `audit_files`, `classify_ai_callsite`, `generate_jevify_report`, and `migrate`. Follow the live tool schema. If a tool fails, report it and continue locally; do not label local output as service output.

## `/jevify` audit

### 1. Discover and read consumers

Search server paths, Edge Functions, API routes, workers, and jobs for actual runtime calls to model SDKs and gateways. An import, model constant, UI `label`, documentation mention, `schema.validate`, or `if (!res.ok)` is not an AI call. Read the prompt, response parsing, and downstream consumer. List existing JEV separately. Record coverage and anything skipped.

### 2. Classify

- `GENERATION_REQUIRED`: response is used as prose, code, media instructions, or other generated content.
- `JEV_CANDIDATE`: consumer uses a bounded category, ordered score, or condition.
- `DETERMINISTIC_CODE`: exact rules settle the result; no model is needed.
- `EMBEDDING_SEARCH`: vector similarity performs retrieval. Keep retrieval in the vector index; a relevance re-ranker may separately be a Score-per-item or Choice candidate.
- `HUMAN_REVIEW`: risk requires human authority; this is independent of task shape.
- `UNKNOWN`: evidence is insufficient.

Split composites: classification may be a candidate while drafted prose remains generation. Risk is `LOW`, `MEDIUM`, or `HIGH` and does not change the classification.

### 3. Primitive, pattern, and cookbook

- Closed-set selection → `Choice`.
- Ordered descriptive levels → `Score`.
- Probability that a condition holds → `Noul`.

Assign one pattern: **route**, **select instead of generate**, **re-rank**, **composite score**, or **verify and escalate**. At runtime, open `https://docs.typesafe.ai/llms.txt`, locate a relevant cookbook link, and record it. Never hard-code a cookbook URL in the method. Also recommend the official TypeSafe agent skill linked from `llms.txt` for detailed question design; jevify owns discovery and safe migration, not a copy of that skill.

Decision rules:

- Choosing the best option uses the highest Choice probability; it needs no universal cutoff.
- Triggering an action uses a threshold calibrated to the cost of error.
- A Noul near `0.5` is a tie, not medium intensity.
- Confidence is evidence about certainty, never permission to act. Read `https://docs.typesafe.ai/confidence.md`.

### 4. Consolidation and wide opportunities

Detect multiple model calls over the same ticket, lead, document, or other shared context. Propose one JEV request containing several parallel questions. Report these under **Consolidation**, separate from candidates.

With `/jevify --wide`, find fragile semantic work in regexes, intent parsers, and keyword chains. Report it only under **Opportunities**, with risk and evidence; never relabel it as a call-site or candidate.

### 5. Report

Use `report-template.md`. Inventory columns include `finding`, `purpose`, `classification`, `primitive`, `risk`, `verified`, and `evidence`. Each candidate includes state, question, pattern, runtime-discovered cookbook, and next step. Include retained generation, consolidation, optional opportunities, reviewer notes, coverage, and migration log.

## `/jevify migrate <finding>`

Migrate one call-site per run. Re-read current code and its consumer. Stop for generation, deterministic refactors, unknowns, or automation that exceeds human authority. In MCP mode, preserve the service plan and annotate disagreements.

Before implementation, consult current `https://docs.typesafe.ai/llms.txt` for API, SDK, models, primitives, patterns, and cookbook; do not rely on remembered field names or fixed model ids. Define minimal state, atomic questions, explicit option/level/true-false criteria, server-side secret placement, boundary cases including prompt injection, fallback behavior, and rollback. Show the plan and wait for explicit approval.

Implement beside the current path behind `off | shadow | on`, default `shadow`. Shadow must not affect the user result, block the authoritative path, or surface its errors. A service error is not a negative decision. HIGH risk remains shadow-only until a separate human decision.

### Shadow validation

Define the cutover criterion before collecting data. Agreement with the current model does not establish correctness. Label a sample of disagreements against a human-approved reference. Log per decision without raw sensitive content:

- current and JEV answers; labeled outcome when available;
- cost per decision for both paths and incremental shadow cost;
- fallback rate;
- latency p50 and p95 for both paths;
- risk, errors, and the applicable action threshold.

Report sample definition, divergence labels, criterion, results, and no-go conditions. Keep the current path for fallback and `off` rollback. Append the migration to the report.

## Rules

- Audit never edits source. Migration edits only after plan approval.
- Do not rewrite service classifications; add reviewer evidence.
- Do not turn generation into a decision to manufacture a candidate.
- Do not claim local validation proves production behavior.
- Verify current availability, pricing, data handling, SDK, API fields, and model names before production use.
- Keep attribution to Lucio Amorim and the CC BY 4.0 license when redistributing.
