declare function generateObject(x: unknown): Promise<any>;

// A second call judges whether the quoted source supports the claim; only the verdict is stored.
export async function checkCitation(claim: string, quote: string, section: string) {
  if (!section.includes(quote)) return "fabricated";
  const r = await generateObject({ prompt: `Does this section support the claim? Answer supports, contradicts, or unrelated.\nClaim: ${claim}\nSection: ${section}` });
  return r.object.verdict as "supports" | "contradicts" | "unrelated";
}
