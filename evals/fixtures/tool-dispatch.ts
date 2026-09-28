declare function generateText(x: unknown): Promise<any>;
declare const tools: Record<string, (args: any) => Promise<unknown>>;

// Tools take closed-set arguments (symbol, window); the reply text is never shown.
export async function handle(request: string) {
  const r = await generateText({
    prompt: request,
    toolChoice: "required",
    tools: {
      plot_price: { parameters: { symbol: ["SPY", "NVDA", "AAPL"], window: ["1d", "1mo", "1y"] } },
      list_symbols: { parameters: {} },
    },
  });
  const call = r.toolCalls[0];
  return tools[call.toolName](call.args);
}
