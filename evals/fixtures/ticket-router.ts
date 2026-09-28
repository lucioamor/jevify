declare function generateObject(x: unknown): Promise<any>;
export async function route(ticket: { message: string }) {
  const r = await generateObject({ prompt: `Choose sales, support, or other: ${ticket.message}` });
  return dispatch(r.object.queue);
}
declare function dispatch(queue: string): unknown;
