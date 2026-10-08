# jevify report template

Mode: local | MCP · Date: YYYY-MM-DD · Audit id: — · Skill: v1.4.1

## Summary

`N` runtime call-sites inspected · `X` candidates · `Y` generation tasks retained · `Z` deterministic findings · `U` unknown.

## Inventory

| finding | purpose | classification | primitive | risk | verified | evidence |
|---|---|---|---|---|---|---|
| `path/file.ts#42` | Route a ticket | JEV_CANDIDATE | Choice | LOW | confirmed | Consumer dispatches only the selected queue |

`verified` is `confirmed`, `disputed`, or `not checked` for service results in MCP mode; it records the agent's consumer-side check without rewriting the service classification. In local mode write `n/a (local)`.

## Candidate details

### `path/file.ts#42`

```text
current:      what the current call decides and how the consumer uses it
recommended:  Choice + minimal state + atomic question
pattern:      Intent routing (TypeSafe pattern, or —)
cookbook:     classification_using_confidence (primary) · companion if any; confirmed in llms.txt, else "unverified"
fit:          why this recipe matches; what the app must adapt
effect:       hypothesis to measure; no numerical promise
architecture: shadow comparison → calibrated action policy → current path fallback
next step:    /jevify migrate path/file.ts#42
```

## Retained generation

- List prose/code generation that must remain generation.

## Consolidation

| shared context | current calls | proposed parallel questions | evidence | risk |
|---|---|---|---|---|

## Opportunities (`--wide`)

| location | semantic work | evidence | risk | possible direction | cookbook |
|---|---|---|---|---|---|

These are opportunities, never call-site candidates.

## Reviewer notes

- Preserve MCP outputs and document disputed classifications with consumer evidence.

## Coverage

- Scope searched, files read, skipped/unreadable files, and known blind spots.

## Shadow validation plan

- Criterion fixed before collection:
- Labeled divergence sample and authority:
- Cost per decision, current path:
- Cost per decision, JEV path:
- Incremental shadow cost:
- Fallback rate:
- Latency p50/p95 for each path:
- Error and risk thresholds:
- No-go conditions:

Agreement alone is not correctness. Confidence is not permission to act. Choice selection and action thresholds are separate policies; a Noul near `0.5` is a tie.

## Migration log

| date | finding | state | flag |
|---|---|---|---|

## Footer

Project: https://github.com/lucioamor/jevify · Check current availability, pricing, data handling, API, SDK, and models before production use. Expected effects remain hypotheses until measured.
