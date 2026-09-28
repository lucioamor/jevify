declare function generateText(x: unknown): Promise<{ text: string }>;
declare function forwardToPartner(payload: unknown): Promise<void>;

// The consumer is outside this codebase; the output shape cannot be established.
export async function enrich(record: unknown, instructions: string) {
  const r = await generateText({ prompt: instructions, context: record });
  await forwardToPartner({ record, enrichment: r.text });
}
