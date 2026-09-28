declare function generateObject(x: unknown): Promise<any>;
declare function assign(t: { queue: string; urgency: number; refundEligible: boolean }): unknown;

// Three separate model calls, each reduced to a bounded value about the same ticket.
export async function triage(ticket: { id: string; message: string }) {
  const queue = await generateObject({ prompt: `Pick one queue (sales, support, billing): ${ticket.message}` });
  const urgency = await generateObject({ prompt: `Rate urgency from 1 to 5: ${ticket.message}` });
  const eligible = await generateObject({ prompt: `Is this a refund request under 30 days? true/false: ${ticket.message}` });
  return assign({ queue: queue.object.queue, urgency: urgency.object.level, refundEligible: eligible.object.value });
}
