# jevify

Runtime model calls often hide small structured decisions inside expensive or hard-to-validate generation paths.

## Before and after

```ts
// Before: a model call returns a label; the app only uses the label.
const result = await generateObject({
  schema: z.object({ queue: z.enum(["sales", "support", "other"]) }),
  prompt: `Route this ticket: ${ticket.message}`,
});
return dispatch(result.object.queue);
```

```ts
// After /jevify migrate: JEV beside the current path, behind a flag. Shadow never blocks or changes the answer.
const MODE = env.JEVIFY_TRIAGE_MODE ?? "shadow";   // off | shadow | on
const MIN_CONFIDENCE = 0.8;                        // placeholder until tuned on shadow data

if (MODE === "on") {
  const jev = await decideQueue(ticket).catch(() => null);  // error or timeout → current path, never "no"
  if (jev && jev.answer !== "insufficient_context" && jev.confidence >= MIN_CONFIDENCE) {
    return dispatch(jev.answer);
  }
}
const current = await currentModelRoute(ticket);    // the existing generateObject call, unchanged
if (MODE === "shadow") void decideQueue(ticket).then((jev) => logShadow({ current, jev })).catch(() => {});
return dispatch(current);
```

`decideQueue` sends a Choice question over `{ ticket }`; its request shape comes from the current TypeSafe docs at migration time.

## What the audit produces

From the [sample report](evals/sample-report-local-v1.3.md) over this repository's [`evals/`](evals/) fixtures (local mode, `--wide`):

```text
16 runtime call-sites in 13 files · 10 JEV candidates (1 inside a composite) · 2 generation tasks retained
1 deterministic · 1 embedding search · 1 human review · 1 unknown · 1 consolidation group · 1 wide opportunity

evals/fixtures/ticket-router.ts#3    | JEV_CANDIDATE       | Choice | LOW  | dispatch() uses only the label
evals/fixtures/announcement.ts#6     | GENERATION_REQUIRED | —      | —    | publish(r.text)
evals/fixtures/ban-account.ts#6      | HUMAN_REVIEW        | —      | HIGH | policy requires a moderator
Consolidation: consolidation.ts #6 #7 #8 → one request with Choice + Score + Noul over { ticket }
```

How that was produced and what it does not prove: [evals/results-local-v1.3.md](evals/results-local-v1.3.md).

## Install

- Agent skills: `npx skills add lucioamor/jevify`
- Claude Code: `claude plugin marketplace add lucioamor/jevify` then `claude plugin install jevify@jevify` (**untested until the v1.3 branch is published**)
- Lovable: import `https://github.com/lucioamor/lovable-skill-jevify` under **Settings → Skills → Add → Import from GitHub**

See [INSTALL.md](INSTALL.md) for MCP connection details.

## Commands

- `/jevify` audits and reports without editing source; add `--wide` for non-call semantic-code opportunities.
- `/jevify migrate <finding>` plans and, after explicit approval, migrates one candidate in shadow mode.

Installed as a Claude Code plugin, the command may be namespaced as `/jevify:jevify`.

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
