declare function generateObject(x: unknown): Promise<any>;
export async function handle(ticket: string) {
  const r = await generateObject({ prompt: `Classify the ticket and draft a reply: ${ticket}` });
  saveCategory(r.object.category); send(r.object.reply);
}
declare function saveCategory(x:string):void; declare function send(x:string):void;
