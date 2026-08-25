'use server';

import {
  ProcessCsvInputSchema,
  ProcessCsvOutputSchema,
  type ProcessCsvInput,
  type ProcessCsvOutput,
} from '@/ai/schemas/csv-processing';
import { generatePortfolioSummary } from '@/ai/model-client';
import { parseHoldings } from '@/services/csv';
import { getLatestStockPrices } from '@/services/fmp';

export async function processCsv(input: ProcessCsvInput): Promise<ProcessCsvOutput> {
  const { csvData } = ProcessCsvInputSchema.parse(input);
  const imported = parseHoldings(csvData);
  const livePrices = await getLatestStockPrices(imported.map((holding) => holding.symbol));
  const holdings = imported.map(({ importedValue: _importedValue, ...holding }) => ({
    ...holding,
    currentPrice: livePrices[holding.symbol] ?? holding.currentPrice,
  }));
  const totalValue = imported.reduce((sum, holding, index) => {
    return sum + (holding.importedValue ?? holdings[index].shares * holdings[index].currentPrice);
  }, 0);
  const fallback = `${holdings.length} holding${holdings.length === 1 ? '' : 's'} with an estimated current value of ${totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.`;
  const summary = await generatePortfolioSummary(holdings, totalValue).catch(() => fallback);
  return ProcessCsvOutputSchema.parse({ holdings, summary });
}
