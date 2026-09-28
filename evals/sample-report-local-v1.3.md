Mode: local · Date: 2026-09-28 · Audit id: — · Skill: v1.3.0 · Scope: `evals/fixtures/` · Flags: `--wide`

## Summary

16 runtime call-sites in 13 files · 10 JEV candidates (1 inside a composite) · 2 generation tasks retained · 1 deterministic · 1 embedding search · 1 human review · 1 unknown · 1 consolidation group · 1 wide opportunity · 3 files with no call-site.

## Inventory

| finding | purpose | classification | primitive | risk | verified | evidence |
|---|---|---|---|---|---|---|
| `evals/fixtures/ticket-router.ts#3` | Route a ticket | JEV_CANDIDATE | Choice | LOW | n/a (local) | `dispatch(r.object.queue)` uses only the label |
| `evals/fixtures/prompt-constant.ts#3` | Route a message | JEV_CANDIDATE | Choice | LOW | n/a (local) | `ROUTE_PROMPT` in `prompt-text.ts` lists a closed set; returns `r.object.route` |
| `evals/fixtures/urgency-score.ts#2` | Rate urgency | JEV_CANDIDATE | Score | MEDIUM | n/a (local) | returns `r.object.score` on a 1–5 scale |
| `evals/fixtures/eligibility-noul.ts#2` | Customer eligibility | JEV_CANDIDATE | Noul | MEDIUM | n/a (local) | returns `r.object.eligible` |
| `evals/fixtures/high-risk-refund.ts#3` | Approve a refund | JEV_CANDIDATE | Noul | HIGH | n/a (local) | returns `r.object.approved` on a money path — shadow-only |
| `evals/fixtures/classify-and-reply.ts#3` | Categorize + reply | JEV_CANDIDATE (composite) | Choice | MEDIUM | n/a (local) | `saveCategory(category)` is a decision; `send(reply)` is generation |
| `evals/fixtures/consolidation.ts#6` | Pick queue | JEV_CANDIDATE | Choice | MEDIUM | n/a (local) | `queue.object.queue` |
| `evals/fixtures/consolidation.ts#7` | Rate urgency | JEV_CANDIDATE | Score | MEDIUM | n/a (local) | `urgency.object.level` |
| `evals/fixtures/consolidation.ts#8` | Refund eligibility | JEV_CANDIDATE | Noul | MEDIUM | n/a (local) | `eligible.object.value` |
| `evals/fixtures/embedding-rerank.ts#9` | Re-rank shortlist | JEV_CANDIDATE | Score (per item) | LOW | n/a (local) | returns an order over retrieved passages |
| `evals/fixtures/embedding-rerank.ts#7` | Retrieve passages | EMBEDDING_SEARCH | — | LOW | n/a (local) | `embed(query)` → `vectorLookup` |
| `evals/fixtures/customer-response.ts#3` | Reply to customer | GENERATION_REQUIRED | — | — | n/a (local) | returns prose |
| `evals/fixtures/announcement.ts#6` | Store announcement | GENERATION_REQUIRED | — | — | n/a (local) | `publish(r.text)` |
| `evals/fixtures/email-validation.ts#5` | Validate email | DETERMINISTIC_CODE | — | LOW | n/a (local) | syntax is an exact rule |
| `evals/fixtures/ban-account.ts#6` | Ban a user | HUMAN_REVIEW | — | HIGH | n/a (local) | destructive; policy requires a moderator |
| `evals/fixtures/opaque-forward.ts#6` | Enrich a record | UNKNOWN | — | MEDIUM | n/a (local) | caller-supplied prompt; external consumer |

`verified` applies to service results in MCP mode; in local mode the agent's own consumer reading is the classification.

## Candidate details

### `evals/fixtures/ticket-router.ts#3`

```text
current:      generateObject picks sales/support/other; dispatch() uses only the queue
recommended:  Choice[sales, support, other, insufficient_context]
              state: { ticket: { message } }
              question: which team handles the primary request in `ticket.message`
pattern:      route
cookbook:     unverified (docs not fetched in this fixture run)
effect:       hypothesis — lower latency and runtime cost per ticket; measure in shadow
architecture: shadow comparison → calibrated action policy → current path as fallback
next step:    /jevify migrate evals/fixtures/ticket-router.ts#3
```

### `evals/fixtures/high-risk-refund.ts#3`

```text
current:      generateObject approves or denies a refund; the boolean is returned directly
recommended:  Noul "the claim meets the refund policy" with explicit true/false criteria
pattern:      verify and escalate
risk:         HIGH — shadow-only; any action threshold is a separate human decision
next step:    /jevify migrate evals/fixtures/high-risk-refund.ts#3 (stops at shadow)
```

Other candidates follow the same block format.

## Retained generation

- `customer-response.ts#3` and `announcement.ts#6` — prose returned or published.
- The reply half of `classify-and-reply.ts#3`.

## Consolidation

| shared context | current calls | proposed parallel questions | evidence | risk |
|---|---|---|---|---|
| `ticket` in `consolidation.ts` | #6, #7, #8 | Choice queue · Score urgency · Noul refund eligibility, one request over `{ ticket }` | three sequential calls over the same `ticket.message` | MEDIUM |

## Opportunities (`--wide`)

| location | semantic work | evidence | risk | possible direction |
|---|---|---|---|---|
| `regex-intent.ts#2-4` | intent from keywords | regex chain returns billing/support/other | MEDIUM | a Choice over the same three intents, evaluated against the regex on real traffic |

## Coverage

- Searched: all 17 files in `evals/fixtures/`. Read: 17. Skipped: none.
- No call-site: `http-ok.ts` (plain fetch), `ui-label.ts` (UI property), `prompt-text.ts` (prompt constant, read as context).
- Blind spots: dynamic model selection and calls behind helpers with no visible body.

## Migration log

| date | finding | state | flag |
|---|---|---|---|

Project: https://github.com/lucioamor/jevify · Verify JEV availability, pricing, and data terms before production. Effects are hypotheses until measured in shadow mode.
