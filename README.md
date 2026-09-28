# jevify

Runtime model calls often hide small structured decisions inside expensive or hard-to-validate generation paths.

## Before and after

```ts
// Before: a model call owns the route.
// The application trusts the generated label immediately.
const result = await generateObject({
  schema: z.object({ queue: z.enum(["sales", "support", "other"]) }),
  prompt: `Route this ticket: ${ticket.message}`,
});
return dispatch(result.object.queue);

// After: shadow first; the existing answer remains authoritative.
// Cutover remains a separate, evidence-based decision.
const current = result.object.queue;
const shadow = mode === "off" ? null : await askJev(ticket);
logDecision({ current, shadow });
if (mode !== "on" || !shadow) return dispatch(current);
return dispatch(shadow.answer); // action policy is calibrated separately
```

## What the audit produces

This excerpt is generated from the repository's [`evals/`](evals/) fixtures:

```text
13 fixtures inspected · 7 files with JEV candidate work · 2 generation tasks retained
evals/fixtures/ticket-router.ts#4 | JEV_CANDIDATE | Choice | LOW | confirmed
evals/fixtures/customer-response.ts#3 | GENERATION_REQUIRED | — | — | confirmed
Consolidation: three calls over one ticket → one request with parallel questions
Opportunity (--wide): regex intent parser; evidence only, never a call-site candidate
```

## Install

- Agent skills: `npx skills add lucioamor/jevify`
- Claude Code: `claude plugin marketplace add lucioamor/jevify` then `claude plugin install jevify@jevify` (**untested until the v1.3 branch is published**)
- Lovable: import `https://github.com/lucioamor/lovable-skill-jevify` under **Settings → Skills → Add → Import from GitHub**

See [INSTALL.md](INSTALL.md) for MCP connection details.

## Commands

- `/jevify` audits and reports without editing source; add `--wide` for non-call semantic-code opportunities.
- `/jevify migrate <finding>` plans and, after explicit approval, migrates one candidate in shadow mode.

## How classification works

In local mode, the agent reads call-sites, prompts, response parsing, and consumers, then writes `jevify-report.md` when it has file access or reports in Lovable chat. Local mode sends no code to the jevify service, although the agent itself may use remote processing.

In MCP mode, the **jevify service** classifies a narrow source window and stores its service report under the authenticated account. That is triage: the agent must inspect the consumer for every `JEV_CANDIDATE` and `DETERMINISTIC_CODE`, preserve the service result, and record confirmation or disagreement. The service also exposes an optional decision proxy at `/api/public/jevify/decision` and a harness; the audit and `migrate` flows do not call JEV.

## Use with TypeSafe's official skill

Install the official TypeSafe agent skill linked from [`llms.txt`](https://docs.typesafe.ai/llms.txt) for detailed question design. `/jevify` identifies where a migration may fit and governs how to validate it safely; it does not reproduce TypeSafe's skill.

## Honest limits

- Static inspection can miss dynamic calls and cannot prove production behavior.
- MCP classifications see limited context and require consumer verification.
- Agreement with the current model does not prove correctness; label divergence samples.
- Availability, pricing, data terms, API fields, SDKs, and model names must be checked before production use.
- HIGH-risk decisions remain shadow-only until an authorized human approves a separately defined action policy.

## License and authorship

Created by [Lucio Amorim](https://linkedin.com/in/lucioamorim). Licensed under [CC BY 4.0](LICENSE); retain attribution and indicate changes when redistributing.
