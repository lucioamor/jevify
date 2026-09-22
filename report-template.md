# jevify report template

Reference format for the report produced by `/jevify`. The Lovable variant returns it in chat; the Claude Code variant writes `jevify-report.md`. Replace the illustrative entries with observed findings. Do not invent measurements.

---

## Summary

`N` runtime AI call-sites inspected · `X` JEV candidates · `Y` generation tasks retained · `Z` deterministic code candidates · `W` other findings.

## Inventory

| file:line | purpose | classification | primitive | risk | reason |
|---|---|---|---|---|---|
| `supabase/functions/triage/index.ts:42` | Routes a ticket | JEV_CANDIDATE | Choice | LOW | Uses only the category label |
| `supabase/functions/reply/index.ts:15` | Writes a customer reply | GENERATION_REQUIRED | — | — | Sends generated prose to the user |
| `src/api/validate.ts:8` | Validates email format | DETERMINISTIC_CODE | — | — | Exact rules determine the result |

## Candidate details

### `supabase/functions/triage/index.ts:42`

```text
current:      LLM classifies tickets as sales, support, or cancellation and returns JSON
recommended:  Choice["sales","support","cancellation","other"]
              state: { message, channel, customer_plan }
              question: ticket intent
effect:       hypothesized reduction in latency or runtime AI cost; requires measurement
architecture: JEV decision → validated acceptance threshold → LLM fallback or human review
risk:         LOW
next step:    plan implementation and validation separately from diagnosis
```

## Retained generation tasks

- `supabase/functions/reply/index.ts:15` — writes a customer reply; generation is required.

## Footer

- Project reference: https://github.com/lucioamor/jevify
- Check current JEV availability and integration requirements before production use.
- Expected effects are **hypotheses**, not promises. Validate quality, latency, cost, and fallback behavior in shadow mode before claiming improvements.
- Implementation and validation are separate from the basic diagnostic skill.
