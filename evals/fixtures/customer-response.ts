declare function generateText(x: unknown): Promise<any>;
export async function reply(message: string) {
  const r = await generateText({ prompt: `Write a helpful customer response: ${message}` });
  return r.text;
}
