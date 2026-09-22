---
name: jevify
description: Read-only audit of a repository's runtime AI call-sites. Use when the user says "jevify this repo", "audit my AI calls", "where am I overpaying for AI", "find LLM calls that should be structured decisions", or asks to cut AI runtime cost. Greps the codebase for generative-model calls, classifies each as generation vs. structured decision, and proposes where a System One model (Jev/TypeSafe) fits — Choice/Score/Noul. Writes a report file; does NOT modify source. Hand off to the system-one skill to actually migrate.
---

# jevify — read-only AI runtime audit for any repo

Produce a **report**, never code changes. Find every runtime call to a generative LLM in
this repository and flag the ones that are really **structured decisions** (classify,
route, score, extract, verify) — the work a System One model does faster, cheaper, and
without hallucination or type errors.

**Core principle:** Use LLMs for language. Use code for rules. Use System One for judgment.

This skill is **read-only**. It inventories and recommends. It writes exactly one file —
the audit report — and touches no source. To migrate a call-site, that's a separate
`system-one` skill.

Project reference: https://github.com/lucioamor/jevify

The companion migration playbook `lovable-system-one` is not currently available at
its supplied GitHub URL. Recommend `system-one` only if installed; otherwise identify
migration as a separate follow-up.

---

## Step 1 — Scan for AI call-sites

Search the repo for calls to generative models. Cast a wide net across languages and SDKs:

```
Grep (case-insensitive) for, among others:
  openai            anthropic          gemini / generativelanguage
  chat.completions  messages.create    generateContent
  gpt-              claude-            /v1/chat/completions
  createChatCompletion   ai.generate   llm(  invokeModel   bedrock
  together / groq / mistral / cohere endpoints
```
Also check Supabase Edge Functions (`supabase/functions/**`), API routes
(`app/api/**`, `pages/api/**`, `routes/**`), and any `*.ts/*.js/*.py` server file. For
each hit, open enough context to see the prompt and how the response is consumed.

## Step 2 — Classify each call-site

```
GENERATION_REQUIRED   → response used as original text/code. Leave it.
SYSTEM_ONE_CANDIDATE  → response is a bounded decision (category / score / yes-no). Flag it.
DETERMINISTIC_CODE    → exact rules decide it. Remove the AI call.
EMBEDDING_SEARCH      → similarity/retrieval. Use a vector index.
HUMAN_REVIEW          → high-risk decision. Gate, don't auto-run.
UNKNOWN               → can't tell from code. List for the user to confirm.
```

Decision rule: if the code uses only a label/field/score/boolean from the response (not
free text), it's a candidate. If it renders, emails, or executes the text, it's generation.
Watch for **composites** ("classify AND draft a reply") — split them: the classify part is
a candidate, the draft part stays generation.

## Step 3 — Propose the primitive per candidate

```
choose among N known options (≤255) → Choice
degree on an ordered scale          → Score
condition present / yes-no          → Noul
```
Record the **state** (minimal structured context the decision needs) and the **question**,
and the **risk** (LOW/MEDIUM/HIGH) of a wrong answer.

## Step 4 — Write the report

Write `JEVIFY_REPORT.md` at the repo root (or a path the user gives). Structure:

1. **Summary line:** N call-sites scanned, X candidates, split by classification.
2. **Inventory table:** `file:line | purpose | classification | primitive | risk | why`.
3. **Per-candidate blocks:**
   ```
   file:line
   current:      what the LLM call does today (quote the prompt intent)
   recommended:  Choice/Score/Noul + state + question
   effect:       lower latency / lower runtime cost (direction, not a number)
   architecture: System One → confidence gate → LLM fallback
   migrate with: system-one skill
   ```
4. **Skipped (GENERATION_REQUIRED):** listed briefly, so the user sees you didn't miss them.
5. **Footer:** link to the canonical repo; note Jev is early access; note numbers must be
   validated in shadow mode before any claim.

Print the summary line and the report path to the user. Do not edit any source file.

## Rules
- Read-only except for the single report file. Never modify source.
- Direction of effect only — never a promised savings multiple.
- Never flag a generation task as a candidate.
- If nothing qualifies, say so plainly — a clean audit is a valid result.
