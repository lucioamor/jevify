# Changelog

## v1.3.0 — 2026-09-28

- Makes `skills/jevify/SKILL.md` the single editable method for coding agents and Lovable.
- Treats service classification as triage and requires consumer-side verification.
- Adds consolidation, optional wide opportunities, patterns, runtime cookbook discovery, and stronger shadow validation.
- Adds eval fixtures, deterministic checks, catalog export, and Claude Code plugin packaging.
- QA pass: restores the call-site search list, decision signals, `path#line` ids, Choice reserve options, MCP upload rules, and migration hand-off lost in the rewrite; inlines the report structure (the skill no longer depends on a file it does not ship); fixes the README example so shadow never blocks and `on` falls back; adds a real sample report and fixtures for DETERMINISTIC_CODE, HUMAN_REVIEW, UNKNOWN, and the service's "announcement" false positive; generates a Lovable-facing README for the import repository; checks versions, mirror hash, and fixture reasons.

## v1.2.0

- Added one-candidate-at-a-time migration in shadow mode.
