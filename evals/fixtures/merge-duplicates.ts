declare function generateObject(x: unknown): Promise<any>;
declare function mergeRecords(a: string, b: string): Promise<void>;

// A merge rewrites every fact linked to either record; undoing it is manual.
export async function dedupe(a: { id: string; name: string; brewery: string }, b: { id: string; name: string; brewery: string }) {
  const r = await generateObject({ prompt: `Are these the same product?`, a, b });
  if (r.object.same) await mergeRecords(a.id, b.id);
}
