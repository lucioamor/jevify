declare function embed(x:string):Promise<number[]>; declare function rerank(x:unknown):Promise<any>;
export async function search(query:string, docs:string[]) {
  const vector = await embed(query); const shortlist = vectorLookup(vector, docs);
  return rerank({ question:"Score relevance", query, shortlist });
}
declare function vectorLookup(v:number[],d:string[]):string[];
