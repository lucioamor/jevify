declare function generateObject(x:unknown):Promise<any>;
export async function eligible(profile:unknown){ const r=await generateObject({prompt:"Is this customer eligible?",profile}); return r.object.eligible; }
