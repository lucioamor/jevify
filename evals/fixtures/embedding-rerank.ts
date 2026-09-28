declare function embed(x: string): Promise<number[]>;
declare function vectorLookup(v: number[], docs: string[]): string[];
declare function generateObject(x: unknown): Promise<any>;

// Retrieval stays in the vector index; the second call only orders the shortlist.
export async function search(query: string, docs: string[]) {
  const vector = await embed(query);
  const shortlist = vectorLookup(vector, docs);
  const ranked = await generateObject({ prompt: `Order these passages by relevance to: ${query}`, shortlist });
  return ranked.object.order as number[];
}
