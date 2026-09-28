import { ROUTE_PROMPT } from "./prompt-text";
declare function generateObject(x:unknown):Promise<any>;
export async function route(message:string){ const r=await generateObject({prompt:ROUTE_PROMPT+message}); return r.object.route; }
