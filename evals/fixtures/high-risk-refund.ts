declare function generateObject(x:unknown):Promise<any>;
export async function refund(claim:unknown) {
  const r=await generateObject({prompt:"Approve or deny this refund",claim});
  return r.object.approved;
}
