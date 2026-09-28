export function intent(text:string) {
  if (/refund|money back|charged twice/i.test(text)) return "billing";
  if (/broken|error|does not work/i.test(text)) return "support";
  return "other";
}
