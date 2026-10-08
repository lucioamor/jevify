# Changelog

## v1.4.1 — 2026-10-08

- MCP mode also covers the local server `@nxlv-ai/jevify` on npm (`npx -y @nxlv-ai/jevify`): offline, no account, `audit_files`, `classify_ai_callsite` and `migrate`, no stored audits. Upload confirmation applies only to the hosted service; redaction applies to both.
- INSTALL and README document the local server; Lovable keeps the hosted URL.
- Code is dual-licensed: prose under CC BY 4.0, code under Apache 2.0 (`LICENSE-CODE`).

## v1.4.0 — 2026-09-28

- Splits step 3 into separate fields: primitive, TypeSafe pattern (Intent routing, Confidence-gated routing, Composite scoring, Speculative fan-out), cookbook (primary + companion), and fit. The old mixed list (route, re-rank, verify and escalate…) is gone.
- Adds a signal → primitive → pattern → cookbook routing table covering the 18 official cookbooks, with `cookbook: none` when nothing fits and the live `llms.txt` as confirmation.
- Classification: verbatim spans and structure-only transforms (code finds or renders the text, JEV picks) are candidates; existing judge, moderation, and validator calls are decision calls.
- Decision policy: gate on reported confidence, not only the winner's probability; pair Choice with an existence Noul when "nothing fits" is likely; give a real middle outcome its own Score level; fall back to a coarser answer when that is cheaper than review; code computes and normalizes.
- `--wide` also reports unchecked decision points around retained generation (guardrails, citations, extracted-field verification).
- Migrate reads the finding's cookbook and the current model's known issues; shadow validation measures the current model's own run-to-run disagreement.
- Cookbook results are cited as recipes, never as expected effects.
- README opens with why jevify exists: everyone talks about performance gains and token savings, and jevify shows what that looks like in a real app — where it applies, what changes, and how to measure it in shadow on your own traffic.
- Six fixtures (verbatim extraction, a non-candidate extraction guard, tool dispatch, citation judge, input moderation, entity merge); `expected.json` records cookbooks, and `check.mjs` verifies they appear in the skill.

## v1.3.0 — 2026-09-28

- Makes `skills/jevify/SKILL.md` the single editable method for coding agents and Lovable.
- Treats service classification as triage and requires consumer-side verification.
- Adds consolidation, optional wide opportunities, patterns, runtime cookbook discovery, and stronger shadow validation.
- Adds eval fixtures, deterministic checks, catalog export, and Claude Code plugin packaging.
- QA pass: restores the call-site search list, decision signals, `path#line` ids, Choice reserve options, MCP upload rules, and migration hand-off lost in the rewrite; inlines the report structure (the skill no longer depends on a file it does not ship); fixes the README example so shadow never blocks and `on` falls back; adds a real sample report and fixtures for DETERMINISTIC_CODE, HUMAN_REVIEW, UNKNOWN, and the service's "announcement" false positive; generates a Lovable-facing README for the import repository; checks versions, mirror hash, and fixture reasons.

## v1.2.0

- Added one-candidate-at-a-time migration in shadow mode.
