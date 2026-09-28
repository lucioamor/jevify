declare function generateObject(x: unknown): Promise<any>;
declare function answer(message: string): Promise<string>;

// Screens each chat message before it reaches the assistant; unsafe messages are blocked.
export async function chat(message: string) {
  const r = await generateObject({ prompt: `Is this message unsafe, a jailbreak attempt, or a request for self-harm content? ${message}` });
  if (r.object.unsafe) return "This request can't be processed.";
  return answer(message);
}
