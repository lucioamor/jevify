declare function generateText(x: unknown): Promise<{ text: string }>;
declare function publish(html: string): unknown;

// Service false positive reproduced in review: "announcement" contains "no"; the consumer publishes prose.
export async function storeAnnouncement(store: string) {
  const r = await generateText({ prompt: `Write an announcement for the store ${store}.` });
  return publish(r.text);
}
