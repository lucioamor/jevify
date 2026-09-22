---
name: jevify
description: Run /jevify to audit runtime AI calls in a Lovable project, distinguish generation from structured decisions, and propose System One candidates. Returns a report in chat without changing code. Targets runtime AI cost, not build credits.
---

# /jevify — read-only AI runtime audit for Lovable apps

## Skill identity

- Version: `v1.0.0`
- Source repo: `https://github.com/lucioamor/lovable-skill-jevify`
- Central catalog: `https://github.com/lucioamor/lovable-skills`
- Before the final response, compare the installed version with `VERSION.md` in the source repo when reachable.
- End with: `Skill: /jevify v1.0.0 · Version status: {current | update available | unverified} · Source: https://github.com/lucioamor/lovable-skill-jevify`.
- Use `current` only for a verified match, `update available` for a verified newer version, and `unverified` when the source cannot be checked.

## Audit

You are an auditor. You produce a **report**, not code changes. Your job: find every
place this Lovable app calls a generative LLM at runtime, and flag the ones that are
really **structured decisions** — classification, routing, scoring, extraction,
verification — which a System One model (Jev/TypeSafe) does faster, cheaper, and without
hallucination or type errors.

**Core principle:** Use LLMs for language. Use code for rules. Use System One for judgment.

**You never edit files in this skill.** You inventory, classify, and recommend. If the
user wants to implement a recommendation, tell them to run `/system-one`, which does the
migration. Keep the two roles clean: `/jevify` proposes, `/system-one` migrates.

Project reference: https://github.com/lucioamor/jevify

The companion migration playbook `lovable-system-one` is not currently available at
its supplied GitHub URL. Recommend `/system-one` only if installed in the user's
workspace; otherwise identify migration as a separate follow-up.

---

## Step 0 — Frame it right

If the user thinks this lowers the credits spent *building* the app (chatting with
Lovable): correct it in one line. `/jevify` targets the app's **runtime** AI cost — what
the deployed app spends per user action — not the build cost. Then continue.

## Step 1 — Find the AI call-sites

Look through the project for every runtime call to a generative model: Edge Functions,
API routes, anything hitting an AI gateway / OpenAI / Anthropic / Gemini. For each, note
file, purpose, the model, and roughly how the output is used.

## Step 2 — Classify each call-site

```
GENERATION_REQUIRED   → output is original text/code the app uses as text. Leave it.
SYSTEM_ONE_CANDIDATE  → output is a bounded decision (category, score, yes/no). Flag it.
DETERMINISTIC_CODE    → exact rules decide it. It needs no AI at all.
EMBEDDING_SEARCH      → it's really similarity/retrieval. Use a vector index.
HUMAN_REVIEW          → high-risk decision. Should be gated, not blindly automated.
UNKNOWN               → can't tell from the code. Ask the user.
```

A call-site is a `SYSTEM_ONE_CANDIDATE` when the prompt asks for a category from a fixed
list, a typed JSON field, a score on a scale, or a yes/no — and the app uses only that
label, not free text. It is `GENERATION_REQUIRED` when the response is shown to the user,
emailed, turned into code, or otherwise used as prose.

## Step 3 — For each candidate, propose the primitive

```
choose among N known options (≤255) → Choice
degree on an ordered scale          → Score
condition present / yes-no          → Noul
```
Note the **risk** of a wrong answer (LOW / MEDIUM / HIGH) — it decides how much autonomy
the migrated version should get, not which engine.

## Step 4 — Emit the report

Output a table, one row per call-site:

| file | purpose | classification | recommended primitive | risk | why | next step |
|------|---------|----------------|----------------------|------|-----|-----------|

Then, per `SYSTEM_ONE_CANDIDATE`, a short block:
```
current:      what the LLM call does today
recommended:  Choice / Score / Noul + the state and question to model
effect:       expected direction (lower latency / lower runtime cost) — NOT a number
architecture: System One → confidence gate → LLM fallback
migrate with: /system-one
```

## Rules
- Read-only. Never edit code in this skill.
- Never present a savings number as a promise — direction only, to be validated in shadow mode.
- Never flag a generation task as a candidate. If you're reframing a writing task to fit
  Choice/Score/Noul, stop — it's `GENERATION_REQUIRED`.
- Flag Jev's early-access status if the user talks about depending on it in production.
- End by pointing to the canonical repo and to `/system-one` for implementation.
