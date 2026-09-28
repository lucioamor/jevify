declare function generateObject(x:unknown):Promise<any>;
export async function urgency(ticket:string){ const r=await generateObject({prompt:"Rate urgency from 1 to 5",ticket}); return r.object.score; }
