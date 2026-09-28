declare function ask(x:string):Promise<any>;
export async function triage(ticket:string) {
  const queue=await ask(`Queue: ${ticket}`); const urgency=await ask(`Urgency: ${ticket}`);
  const eligible=await ask(`Eligible: ${ticket}`); return {queue,urgency,eligible};
}
