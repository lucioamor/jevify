# jevify diagnostics in Lovable

`/jevify` is the jevify project's basic **read-only** skill. It audits a Lovable project and identifies runtime generative LLM calls that may be candidates for structured decisions with JEV. It produces a report without modifying the app.

## Install in a Lovable workspace

Import the public repository through **Settings → Skills → Add → Import from GitHub**:

```text
https://github.com/lucioamor/lovable-skill-jevify
```

Use this standalone repository, which contains `SKILL.md` at the root. You can also upload the project's `lovable/SKILL.md` through the workspace skill settings. Preserve the frontmatter, including `name: jevify` and `description`.

Once installed, the skill is available across the workspace through `/jevify`. Re-import the repository when a new version is published.

## Usage

In a project's builder chat:

```text
/jevify
```

You can also ask: "Audit this app's runtime AI calls."

The agent will:

1. Locate runtime AI calls, including Edge Functions and AI gateway calls.
2. Classify each call-site as a JEV candidate, generation, deterministic code, retrieval, human review, or unknown.
3. Propose Choice/Score/Noul, the required state, and risk for each candidate.
4. Return the report in chat.

## Scope

- Targets the published app's **runtime** AI usage, not **build** credits.
- Audits and recommends without changing the app.
- Does not install or connect a hosted MCP service.

## After the report

Plan implementation and validation separately. The [jevify repository](https://github.com/lucioamor/jevify) houses the skill variants, instructions, and report template. It does not yet offer a migration skill or executable JEV integration.

```text
/jevify       → diagnose and recommend (read-only)
follow-up     → implement and validate recommendations
```

## Notes

- Diagnosis requires no JEV API key. Any future integration should keep credentials on the backend.
- The current skill reports expected effects as hypotheses, without promised numbers. Validate them in shadow mode.
- Check current JEV availability and integration requirements before production use.
