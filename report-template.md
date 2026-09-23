# jevify report template

Reference format for the report produced by `/jevify` in local mode. The Lovable variant returns it in chat; the repository variant writes `jevify-report.md`. In MCP mode the jevify service renders its own report, and the agent saves it with the same header line. Replace the illustrative entries with observed findings. Do not invent measurements.

---

Mode: local · Date: YYYY-MM-DD · Audit id: — (MCP mode only)

## Summary

`N` runtime AI call-sites inspected · `X` JEV candidates · `Y` generation tasks retained · `Z` deterministic code candidates · `W` other findings.

## Inventory

| finding | purpose | classification | primitive | risk | reason |
|---|---|---|---|---|---|
| `supabase/functions/triage/index.ts#42` | Routes a ticket | JEV_CANDIDATE | Choice | LOW | Uses only the category label |
| `supabase/functions/reply/index.ts#15` | Writes a customer reply | GENERATION_REQUIRED | — | — | Sends generated prose to the user |
| `src/api/validate.ts#8` | Validates email format | DETERMINISTIC_CODE | — | — | Exact rules determine the result |

## Candidate details

### `supabase/functions/triage/index.ts#42`

```text
finding:      supabase/functions/triage/index.ts#42
current:      LLM classifies tickets as sales, support, or cancellation and returns JSON
recommended:  Choice["sales","support","cancellation","other","insufficient_context"]
              state: { message, channel, customer_plan }
              question: which team handles the primary request in `ticket.message`
effect:       hypothesized reduction in latency or runtime AI cost; requires measurement
architecture: JEV decision → validated confidence gate → current LLM path as fallback
risk:         LOW
next step:    /jevify migrate supabase/functions/triage/index.ts#42
```

## Retained generation tasks

- `supabase/functions/reply/index.ts#15` — writes a customer reply; generation is required.

## Coverage

- Searched: server files, Edge Functions, and API routes; dependencies, build output, tests, and docs skipped.
- Files read: `N`. Unreadable or skipped: list them, or "none".

## Migration log

Written by `/jevify migrate`. Leave empty until a migration runs.

| date | finding | state | flag |
|---|---|---|---|
| YYYY-MM-DD | `supabase/functions/triage/index.ts#42` | shadow | `JEVIFY_TRIAGE_MODE` |

## Footer

- Project reference: https://github.com/lucioamor/jevify
- Check current JEV availability, pricing, and data terms before production use.
- Expected effects are **hypotheses**, not promises. Validate quality, latency, cost, and fallback behavior in shadow mode before claiming improvements.
