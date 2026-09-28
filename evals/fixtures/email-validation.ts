declare function generateObject(x: unknown): Promise<any>;

// A model call deciding something an exact rule settles.
export async function isValidEmail(value: string) {
  const r = await generateObject({ prompt: `Is this a syntactically valid email address? ${value}` });
  return r.object.valid === true;
}
