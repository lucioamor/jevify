export async function load(){ const res=await fetch("/api/items"); if(!res.ok) throw new Error("request failed"); return res.json(); }
