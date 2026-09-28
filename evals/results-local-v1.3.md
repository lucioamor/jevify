# Local eval — v1.3.0

Mode: local · Date: 2026-09-28 · Scope: `evals/fixtures/`

## Score

13 TypeScript files evaluated: 13 expected classifications matched; 0 mismatches. This is an authored fixture evaluation of the written method, not an automated parser benchmark or evidence of service behavior.

- 7 files contain JEV candidate work (including composite, re-ranking, and consolidation cases).
- 2 retain generation work (one standalone and one composite).
- 2 are explicit false-positive guards (`label` UI and `res.ok`).
- 1 is a `--wide` opportunity only.
- 1 holds a prompt constant and is not itself a call-site.

Manual reasoning matched `expected.json` for class, primitive, risk, and verification. The important guards are: consumer use determines classification; the refund case is HIGH risk and shadow-only; vector retrieval stays in the index while re-ranking is separable; and regex intent code appears only with `--wide`.

## MCP REST reproduction

The MCP/service was not run. To compare service triage, authenticate to the current jevify service, submit these fixture files through its documented REST audit endpoint, preserve the returned classifications, then add consumer-side `verified` values and Reviewer notes. Confirm the live schema before forming a request; this repository does not invent request fields.
