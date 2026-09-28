# Local eval — v1.3.0

Mode: local · Date: 2026-09-28 · Scope: `evals/fixtures/` (17 files) · Full output: [sample report](sample-report-local-v1.3.md)

## What this is

A hand-authored fixture set with an expected answer per file ([expected.json](expected.json)), covering every class in the method plus three non-call-sites, one consolidation group and one `--wide` opportunity. The method was applied manually by the agent that also wrote the fixtures, so the score below checks **consistency of the written method**, not independent accuracy. It is not a benchmark of the jevify service.

## Result

17/17 files matched the expected class, primitive, and risk. Known limits:

- **Circular grading.** Fixtures, expectations, and the run come from the same author. An independent run (another agent or person, without reading `expected.json`) is the next step.
- **Small, clean snippets.** Real repositories hide prompts in helpers, config, and databases.
- **Judgment calls recorded as expected:** the refund case is `JEV_CANDIDATE` + `HIGH` (shadow-only), while the ban case is `HUMAN_REVIEW` because a written policy requires a moderator. A reviewer may reasonably disagree with the first.

## Coverage of the method

| class or guard | fixture |
|---|---|
| JEV_CANDIDATE — Choice / Score / Noul | `ticket-router`, `prompt-constant`, `urgency-score`, `eligibility-noul` |
| Composite | `classify-and-reply` |
| Consolidation | `consolidation` |
| Retrieval + re-rank | `embedding-rerank` |
| HIGH risk, shadow-only | `high-risk-refund` |
| GENERATION_REQUIRED | `customer-response`, `announcement` (service false positive) |
| DETERMINISTIC_CODE | `email-validation` |
| HUMAN_REVIEW | `ban-account` |
| UNKNOWN | `opaque-forward` |
| Not a call-site | `http-ok`, `ui-label`, `prompt-text` |
| `--wide` opportunity | `regex-intent` |

## Service comparison

Not run. To compare, authenticate to the jevify service, submit the fixtures through its documented REST audit endpoint or `audit_files`, keep the returned classifications, and add `verified` values and Reviewer notes from consumer reading. Confirm the live schema first.
