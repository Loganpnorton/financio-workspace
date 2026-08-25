import type { Holding } from '@/ai/schemas/csv-processing';

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

export async function generatePortfolioSummary(
  holdings: Holding[],
  totalValue: number,
  fetcher: typeof fetch = fetch,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return `${holdings.length} holding${holdings.length === 1 ? '' : 's'} with an estimated current value of ${totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.`;
  }
  const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
  const response = await fetcher(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Write one factual sentence summarizing this portfolio. Do not give financial advice. Total value: ${totalValue}. Holdings: ${JSON.stringify(holdings)}` }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 100 },
      }),
    },
  );
  if (!response.ok) throw new Error(`Gemini summary request failed (${response.status}).`);
  const payload = await response.json() as GeminiResponse;
  const summary = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!summary) throw new Error('Gemini returned an empty summary.');
  return summary;
}

