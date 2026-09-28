declare function generateObject(x: unknown): Promise<any>;
declare function saveLead(lead: { company: string; need: string }): Promise<void>;

// Looks like extraction, but `need` is a written summary and `company` may be inferred from a domain.
export async function captureLead(email: string) {
  const r = await generateObject({ prompt: `Extract the company name and summarize what they need in one sentence: ${email}` });
  await saveLead({ company: r.object.company, need: r.object.need });
}
